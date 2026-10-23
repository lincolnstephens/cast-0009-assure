import { addClockEventSchema, closeClockSchema, manualIntakeSchema } from "@maximus/shared";
import { Hono } from "hono";
import { listOrgIds, mutateOrg, newId, readOrg } from "../db/store.ts";
import type { ClockEventRecord } from "../db/model.ts";
import { writeAudit } from "../lib/audit.ts";
import { clockStatus } from "../lib/deadlines.ts";
import {
  clockEventLabel,
  clockReference,
  createIntakeWithClock,
  findClockGlobally,
  recordEntryForClosedClock,
} from "../lib/intakes.ts";
import { requireAuth, requireRole, type AppEnv, ADMIN_ORG_HEADER } from "../lib/middleware.ts";

export const adminRoutes = new Hono<AppEnv>();
adminRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

function byCreatedDesc(a: ClockEventRecord, b: ClockEventRecord): number {
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
}

/** Accounts for the top-bar client-account switcher. */
adminRoutes.get("/accounts", async (c) => {
  const ids = await listOrgIds();
  const docs = await Promise.all(ids.map((id) => readOrg(id)));
  const accounts = docs
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .map((d) => ({ id: d.id, name: d.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return c.json({ accounts });
});

/** All clocks for an account, active first. */
adminRoutes.get("/clocks", async (c) => {
  const accountId = c.req.query("accountId") || c.req.header(ADMIN_ORG_HEADER);
  if (!accountId) return c.json({ error: "accountId is required" }, 400);
  const doc = await readOrg(accountId);
  if (!doc) return c.json({ clocks: [] });

  const now = new Date();
  const rows = doc.clocks
    .slice()
    .sort((a, b) => {
      if (!a.closedAt !== !b.closedAt) return a.closedAt ? 1 : -1; // open first
      return a.startedAt < b.startedAt ? 1 : a.startedAt > b.startedAt ? -1 : 0;
    })
    .map((clock) => {
      const intake = doc.intakes.find((i) => i.id === clock.intakeId);
      return {
        id: clock.id,
        kind: clock.kind,
        reference: intake ? clockReference(intake.type, intake.id) : clock.id,
        summary: intake?.summary ?? null,
        intakeSource: intake?.source ?? null,
        startsAt: clock.startedAt,
        dueAt: clock.dueAt,
        closedAt: clock.closedAt,
        outcome: clock.outcome,
        status: clock.closedAt
          ? null
          : clockStatus(new Date(clock.startedAt), new Date(clock.dueAt), now),
        test: Boolean(clock.test),
      };
    });

  return c.json({ clocks: rows });
});

/** Event timeline for any clock. */
adminRoutes.get("/clocks/:id/events", async (c) => {
  const found = await findClockGlobally(c.req.param("id"));
  if (!found) return c.json({ events: [] });
  const events = found.doc.clockEvents
    .filter((e) => e.clockId === found.clock.id)
    .sort(byCreatedDesc);
  return c.json({
    events: events.map((e) => ({
      id: e.id,
      event: clockEventLabel(e, found.clock),
      note: e.note,
      createdAt: e.createdAt,
      actorName: null,
    })),
  });
});

/** Add a note/event to a clock. */
adminRoutes.post("/clocks/:id/events", async (c) => {
  const parsed = addClockEventSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Enter a note." }, 400);

  const user = c.get("user");
  const found = await findClockGlobally(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);

  const orgId = found.doc.id;
  const eventId = await mutateOrg(orgId, (doc) => {
    const clock = doc.clocks.find((cl) => cl.id === found.clock.id);
    if (!clock) return null;
    const event = {
      id: newId(),
      clockId: clock.id,
      note: parsed.data.note,
      actorId: user.id,
      createdAt: new Date().toISOString(),
    };
    doc.clockEvents.push(event);
    return event.id;
  });
  if (!eventId) return c.json({ error: "Not found" }, 404);

  await writeAudit({
    orgId: orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "clock.event_add",
    detail: `Note added to clock ${found.clock.id}.`,
  });

  return c.json({ ok: true }, 201);
});

/**
 * Close a clock with an outcome. SARs must record whether inside statute
 * (validated by `closeClockSchema`) - it feeds the "data requests on time"
 * KPI tile. A reported concern may also record whether the ICO was
 * notified, feeding the breach KPI tile; `closeClockSchema` does not carry
 * this field (it belongs to the tracker work, not the request-lifecycle
 * schema this route otherwise leaves alone), so it is read directly off the
 * request body alongside the validated fields.
 */
adminRoutes.post("/clocks/:id/close", async (c) => {
  const raw = await c.req.json().catch(() => null);
  const parsed = closeClockSchema.safeParse(raw);
  if (!parsed.success) return c.json({ error: "Enter an outcome." }, 400);

  const user = c.get("user");
  const found = await findClockGlobally(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  if (found.clock.closedAt) return c.json({ error: "Clock is already closed." }, 409);
  if (found.clock.kind === "sar_1_month" && parsed.data.insideStatute === undefined) {
    return c.json({ error: "Closing a SAR must record whether it was inside statute." }, 400);
  }

  const icoNotifiedRaw =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>).icoNotified : undefined;
  const icoNotified = typeof icoNotifiedRaw === "boolean" ? icoNotifiedRaw : null;

  const orgId = found.doc.id;
  const closedAt = new Date();
  const entry = await mutateOrg(orgId, (doc) => {
    const clock = doc.clocks.find((cl) => cl.id === found.clock.id);
    if (!clock || clock.closedAt) return null;
    clock.closedAt = closedAt.toISOString();
    clock.closedBy = user.id;
    clock.outcome = parsed.data.outcome;
    if (clock.kind === "sar_1_month") {
      clock.insideStatute = parsed.data.insideStatute ?? null;
    }
    if (clock.kind === "breach_72h") {
      clock.icoNotified = icoNotified;
    }
    doc.clockEvents.push({
      id: newId(),
      clockId: clock.id,
      note: parsed.data.outcome,
      actorId: user.id,
      createdAt: closedAt.toISOString(),
    });
    // Closing a statutory clock creates a Record entry automatically (see
    // PORTING_BRIEF.md, "the value layer being added") and links it back via
    // clock.entryId. v1.7: a test seat's clock books nothing on the Record.
    if (clock.test) return { id: null, area: null };
    return recordEntryForClosedClock(doc, clock, {
      outcome: parsed.data.outcome,
      closedAt,
      reviewerName: user.displayName,
    });
  });
  if (!entry) return c.json({ error: "Not found" }, 404);

  const insideStatuteDetail =
    parsed.data.insideStatute === undefined
      ? ""
      : ` Inside statute: ${parsed.data.insideStatute ? "yes" : "no"}.`;
  const icoNotifiedDetail =
    found.clock.kind === "breach_72h" && icoNotified !== null
      ? ` ICO notified: ${icoNotified ? "yes" : "no"}.`
      : "";
  await writeAudit({
    orgId: orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "clock.close",
    detail: `Clock ${found.clock.id} closed: ${parsed.data.outcome}${insideStatuteDetail}${icoNotifiedDetail} ${entry.id ? `Record entry ${entry.id} created (module ${entry.area}).` : "Test seat clock: nothing booked on the Record."}`,
  });

  return c.json({ ok: true });
});

/** Manual intake creation - same path as the client's "raise a request". */
adminRoutes.post("/intakes", async (c) => {
  const parsed = manualIntakeSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Choose an account, a type and a summary." }, 400);
  }
  const user = c.get("user");
  const orgId = parsed.data.clientAccountId;

  const result = await mutateOrg(orgId, (doc) =>
    createIntakeWithClock(doc, {
      type: parsed.data.type,
      source: "manual",
      summary: parsed.data.summary,
      raisedBy: user.id,
    }),
  );

  await writeAudit({
    orgId: orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "intake.create",
    detail: `${parsed.data.type === "sar" ? "SAR" : "Breach"} intake created manually by the officer (${result.intake.id}).`,
  });

  return c.json(
    {
      intakeId: result.intake.id,
      clockId: result.clock.id,
      reference: clockReference(result.intake.type, result.intake.id),
    },
    201,
  );
});
