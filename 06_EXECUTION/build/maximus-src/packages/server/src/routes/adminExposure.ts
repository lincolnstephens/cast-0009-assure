import { createDemoAlertSchema, updateAlertStateSchema } from "@maximus/shared";
import { Hono } from "hono";
import { listOrgIds, mutateOrg, newId, readOrg } from "../db/store.ts";
import type { ExposureAlertRecord, OrgDoc } from "../db/model.ts";
import { writeAudit } from "../lib/audit.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const adminExposureRoutes = new Hono<AppEnv>();
adminExposureRoutes.use("*", requireAuth, requireRole("mitmark_admin"));

function byCreatedDesc(a: ExposureAlertRecord, b: ExposureAlertRecord): number {
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
}

/**
 * Find the organisation holding a given alert id. The web app's triage call
 * (PUT /admin/exposure/:id/state) carries no accountId, and the store has no
 * cross-tenant index - see findClockGlobally in lib/intakes.ts for the same
 * trade-off applied here for the same reason.
 */
async function findOrgByAlertId(alertId: string): Promise<{ doc: OrgDoc; alert: ExposureAlertRecord } | null> {
  for (const orgId of await listOrgIds()) {
    const doc = await readOrg(orgId);
    if (!doc) continue;
    const alert = doc.alerts.find((a) => a.id === alertId);
    if (alert) return { doc, alert };
  }
  return null;
}

adminExposureRoutes.get("/exposure", async (c) => {
  const accountId = c.req.query("accountId");
  if (!accountId) return c.json({ error: "accountId is required" }, 400);
  const doc = await readOrg(accountId);
  if (!doc) return c.json({ alerts: [] });

  return c.json({
    alerts: doc.alerts.slice().sort(byCreatedDesc).map((a) => ({
      id: a.id,
      kind: a.kind,
      severity: a.severity,
      summary: a.summary,
      officerNote: a.officerNote,
      state: a.state,
      isDemo: a.demo,
      createdAt: a.createdAt,
    })),
  });
});

/**
 * Create a demo alert - `demo` is always true and cannot be overridden.
 *
 * The store carries kind, severity, summary and the officer's note as
 * their own fields, so nothing is folded into a narrative string. The
 * officer's note is the product surface and reaches the client as written.
 */
adminExposureRoutes.post("/exposure", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createDemoAlertSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Enter a kind, severity and summary for the demo alert." }, 400);
  }
  // Strip any client attempt to mark an alert as live.
  if (body && typeof body === "object" && "isDemo" in body) {
    return c.json({ error: "Demo alerts cannot be marked as live monitoring." }, 400);
  }

  const user = c.get("user");
  const orgId = parsed.data.clientAccountId;
  const kindLabel = parsed.data.kind.replace(/_/g, " ");

  const alertId = await mutateOrg(orgId, (doc) => {
    const alert: ExposureAlertRecord = {
      id: newId(),
      orgId,
      kind: parsed.data.kind,
      severity: parsed.data.severity,
      summary: parsed.data.summary,
      officerNote: null,
      state: "new",
      demo: true,
      createdAt: new Date().toISOString(),
    };
    doc.alerts.push(alert);
    doc.review.push({
      id: newId(),
      orgId,
      type: "alert",
      refId: alert.id,
      summary: alert.summary,
      state: "pending",
      decidedBy: null,
      decidedAt: null,
      createdAt: alert.createdAt,
    });
    return alert.id;
  });

  await writeAudit({
    orgId: orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "exposure.create_demo",
    detail: `Demo alert created: ${kindLabel} (${parsed.data.severity}).`,
  });

  return c.json({ id: alertId }, 201);
});

/**
 * Officer-only state transition with a note - audited; the note is
 * client-visible. Since `ExposureAlertRecord` has no dedicated officer-note
 * field (see the comment above the create route), the note is appended to
 * `detail` so it still reaches the client, per DECISIONS.md #46: "the
 * officer note IS the product surface."
 */
adminExposureRoutes.put("/exposure/:id/state", async (c) => {
  const parsed = updateAlertStateSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) {
    return c.json({ error: "Choose a state and write a note for the client." }, 400);
  }

  const user = c.get("user");
  const found = await findOrgByAlertId(c.req.param("id"));
  if (!found) return c.json({ error: "Not found" }, 404);

  const orgId = found.doc.id;
  const fromState = found.alert.state;
  const ok = await mutateOrg(orgId, (doc) => {
    const alert = doc.alerts.find((a) => a.id === found.alert.id);
    if (!alert) return false;
    alert.state = parsed.data.state;
    alert.officerNote = parsed.data.officerNote;

    const reviewItem = doc.review.find(
      (r) => r.type === "alert" && r.refId === alert.id && r.state === "pending",
    );
    if (reviewItem) {
      reviewItem.state = "approved";
      reviewItem.decidedBy = user.id;
      reviewItem.decidedAt = new Date().toISOString();
    }
    return true;
  });
  if (!ok) return c.json({ error: "Not found" }, 404);

  await writeAudit({
    orgId: orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "exposure.state_change",
    detail: `Alert ${found.alert.id} moved from ${fromState} to ${parsed.data.state}.`,
  });

  return c.json({ ok: true });
});

function stateLabel(state: string): string {
  if (state === "triaged") return "Triaged";
  if (state === "actioned") return "Actioned";
  if (state === "dismissed") return "Dismissed";
  return state;
}
