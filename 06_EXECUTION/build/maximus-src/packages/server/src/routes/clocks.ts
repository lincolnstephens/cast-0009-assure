import { raiseRequestSchema } from "@maximus/shared";
import { Hono } from "hono";
import { mutateOrg, readOrg } from "../db/store.ts";
import type { ClockEventRecord, ClockRecord } from "../db/model.ts";
import { writeAudit } from "../lib/audit.ts";
import { clockStatus } from "../lib/deadlines.ts";
import {
  clockEventLabel,
  clockReference,
  createIntakeWithClock,
  findClockGlobally,
} from "../lib/intakes.ts";
import { requireAuth, requireClientSeat, type AppEnv } from "../lib/middleware.ts";

export const clockRoutes = new Hono<AppEnv>();
clockRoutes.use("*", requireAuth, requireClientSeat);

/** Newest-started first, mirroring the previous `orderBy(desc(startsAt))`. */
function byStartedDesc(a: ClockRecord, b: ClockRecord): number {
  return a.startedAt < b.startedAt ? 1 : a.startedAt > b.startedAt ? -1 : 0;
}

function byCreatedDesc(a: ClockEventRecord, b: ClockEventRecord): number {
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
}

/** v1.9 (FRAGO 09 3.1). MITMARK's note on the request's decision, or null when none was given. */
function decisionNoteOf(clock: ClockRecord): { text: string; at: string } | null {
  return clock.decisionNote && clock.decisionNoteAt ? { text: clock.decisionNote, at: clock.decisionNoteAt } : null;
}

function latestNoteFor(events: ClockEventRecord[], clockId: string): string | null {
  const forClock = events.filter((e) => e.clockId === clockId).sort(byCreatedDesc);
  return forClock[0]?.note ?? null;
}

/** List the signed-in client's clocks, scoped to their organisation by construction. */
clockRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ active: [], closed: [] });
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ active: [], closed: [] });

  const now = new Date();
  // v1.7: the client never sees a test seat's requests; a test seat sees only its own.
  const items = doc.clocks
    .filter((clock) => Boolean(clock.test) === Boolean(user.testSeat))
    .sort(byStartedDesc)
    .map((clock) => {
      const intake = doc.intakes.find((i) => i.id === clock.intakeId);
      return {
        id: clock.id,
        kind: clock.kind,
        reference: intake ? clockReference(intake.type, intake.id) : clock.id,
        startsAt: clock.startedAt,
        dueAt: clock.dueAt,
        closedAt: clock.closedAt,
        outcome: clock.outcome,
        status: clock.closedAt
          ? null
          : clockStatus(new Date(clock.startedAt), new Date(clock.dueAt), now),
        latestNote: latestNoteFor(doc.clockEvents, clock.id),
        decisionNote: decisionNoteOf(clock),
      };
    });

  return c.json({
    active: items.filter((i) => !i.closedAt),
    closed: items.filter((i) => i.closedAt),
  });
});

/** A clock's event timeline (read-only). Cross-tenant access -> 403, missing -> 404. */
clockRoutes.get("/:id", async (c) => {
  const user = c.get("user");
  const found = await findClockGlobally(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);
  if (found.doc.id !== user.clientAccountId) return c.json({ error: "Forbidden" }, 403);

  const events = found.doc.clockEvents
    .filter((e) => e.clockId === found.clock.id)
    .sort(byCreatedDesc);

  return c.json({
    id: found.clock.id,
    kind: found.clock.kind,
    reference: found.intake ? clockReference(found.intake.type, found.intake.id) : found.clock.id,
    summary: found.intake?.summary ?? null,
    startsAt: found.clock.startedAt,
    dueAt: found.clock.dueAt,
    closedAt: found.clock.closedAt,
    outcome: found.clock.outcome,
    status: found.clock.closedAt
      ? null
      : clockStatus(new Date(found.clock.startedAt), new Date(found.clock.dueAt), new Date()),
    decisionNote: decisionNoteOf(found.clock),
    events: events.map((e) => ({
      id: e.id,
      event: clockEventLabel(e, found.clock),
      note: e.note,
      createdAt: e.createdAt,
      // No per-event actor display-name lookup against the separate users
      // document in this beta - the note itself has always carried the
      // substance the timeline needs.
      actorName: null,
    })),
  });
});

export const requestRoutes = new Hono<AppEnv>();
requestRoutes.use("*", requireAuth, requireClientSeat);

/**
 * "Raise a request" - the client portal's two intakes (data request, report a
 * concern) are the only things the Information Officer ever fills in here.
 */
requestRoutes.post("/", async (c) => {
  const parsed = raiseRequestSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Choose a request type and describe it briefly." }, 400);
  }
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);

  const result = await mutateOrg(user.clientAccountId, (doc) =>
    createIntakeWithClock(doc, {
      type: parsed.data.type === "data_request" ? "sar" : "breach",
      source: "manual",
      summary: parsed.data.details,
      raisedBy: user.id,
      test: user.testSeat === true,
    }),
  );

  await writeAudit({
    orgId: user.clientAccountId,
    actorId: user.id,
    actorName: user.displayName,
    action: "intake.create",
    detail: `${parsed.data.type === "data_request" ? "SAR" : "Breach"} intake raised by the ${user.testSeat ? "test seat (test)" : "client"} (${result.intake.id}).`,
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
