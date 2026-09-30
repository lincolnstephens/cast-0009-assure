import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { adminOrganisationRoutes } from "./routes/adminOrganisations.ts";
import { adminUserRoutes } from "./routes/adminUsers.ts";
import type { AppEnv } from "./lib/middleware.ts";
import { ensureSeeded } from "./lib/seedData.ts";
import { adminAuditRoutes } from "./routes/adminAudit.ts";
import { adminDocumentRoutes } from "./routes/adminDocuments.ts";
import { adminFigureRoutes } from "./routes/adminFigures.ts";
import { adminExportRoutes } from "./routes/adminExports.ts";
import { adminExposureRoutes } from "./routes/adminExposure.ts";
import { adminRoutes } from "./routes/adminClocks.ts";
import { adminEscalationRoutes } from "./routes/adminEscalations.ts";
import { adminPolicyRoutes } from "./routes/adminPolicies.ts";
import { adminPostureRoutes } from "./routes/adminPosture.ts";
import { adminRecordRoutes } from "./routes/adminRecord.ts";
import { adminReviewRoutes } from "./routes/adminReview.ts";
import { adminWorkplanRoutes } from "./routes/adminWorkplan.ts";
import { authRoutes } from "./routes/auth.ts";
import { chatRoutes } from "./routes/chat.ts";
import { clockRoutes, requestRoutes } from "./routes/clocks.ts";
import { exportRoutes } from "./routes/exports.ts";
import { exposureRoutes } from "./routes/exposure.ts";
import { policyRoutes } from "./routes/policies.ts";
import { postureRoutes } from "./routes/posture.ts";
import { trackerRoutes } from "./routes/tracker.ts";
import { valueRoutes } from "./routes/value.ts";

export const app = new Hono<AppEnv>().basePath("/api");

/**
 * The store starts empty on a fresh deploy, so the demo organisation and its
 * two accounts are seeded on the first request that needs them. It is a no-op
 * once the store has a user, and it is serialised here so two cold starts
 * arriving together cannot seed twice.
 */
let seeding: Promise<void> | null = null;

/** Liveness only. It touches nothing, so it answers even if the store is down. */
app.get("/health", (c) => c.json({ ok: true }));

/**
 * Store readiness, for diagnosing a deploy. It reports whether the store can be
 * reached and seeded, and never returns a credential or a value from it.
 */
app.get("/ready", async (c) => {
  try {
    await ensureSeeded();
    const { readUsers } = await import("./db/store.ts");
    const users = await readUsers();
    return c.json({ ok: true, accounts: users.users.length });
  } catch (err) {
    return c.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 503);
  }
});

/**
 * The API is per-signed-in-user and changes the moment the operator edits
 * anything, so none of it may be cached. Without this the edge serves a stale
 * answer to the client portal after a setting has been changed, which would let
 * illustrative entries keep reaching the Information Officer after the operator
 * had switched them off.
 */
app.use("*", async (c, next) => {
  await next();
  c.header("Cache-Control", "no-store, max-age=0");
  c.header("Netlify-CDN-Cache-Control", "no-store, max-age=0");
});

app.use("*", async (c, next) => {
  if (!seeding) seeding = ensureSeeded().catch((err) => {
    seeding = null;
    throw err;
  });
  await seeding;
  await next();
});

app.route("/auth", authRoutes);
app.route("/chat", chatRoutes);
app.route("/clocks", clockRoutes);
app.route("/exports", exportRoutes);
app.route("/exposure", exposureRoutes);
app.route("/policies", policyRoutes);
app.route("/posture", postureRoutes);
app.route("/requests", requestRoutes);
app.route("/tracker", trackerRoutes);
app.route("/value", valueRoutes);
app.route("/admin", adminAuditRoutes);
app.route("/admin", adminDocumentRoutes);
app.route("/admin", adminRoutes);
app.route("/admin", adminEscalationRoutes);
app.route("/admin", adminExportRoutes);
app.route("/admin", adminExposureRoutes);
app.route("/admin", adminPolicyRoutes);
app.route("/admin", adminPostureRoutes);
app.route("/admin", adminRecordRoutes);
app.route("/admin", adminReviewRoutes);
app.route("/admin", adminWorkplanRoutes);
app.route("/admin", adminUserRoutes);
app.route("/admin", adminOrganisationRoutes);
app.route("/admin", adminFigureRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) return err.getResponse();
  console.error(`[api] ${c.req.method} ${c.req.path}:`, err);
  return c.json({ error: "Something went wrong. Please try again." }, 500);
});
