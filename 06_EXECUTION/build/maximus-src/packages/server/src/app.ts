import { Hono } from "hono";
import type { AppEnv } from "./lib/middleware.ts";
import { ensureSeeded } from "./lib/seedData.ts";
import { adminAuditRoutes } from "./routes/adminAudit.ts";
import { adminExportRoutes } from "./routes/adminExports.ts";
import { adminExposureRoutes } from "./routes/adminExposure.ts";
import { adminRoutes } from "./routes/adminClocks.ts";
import { adminEscalationRoutes } from "./routes/adminEscalations.ts";
import { adminPolicyRoutes } from "./routes/adminPolicies.ts";
import { adminPostureRoutes } from "./routes/adminPosture.ts";
import { adminRecordRoutes } from "./routes/adminRecord.ts";
import { adminReviewRoutes } from "./routes/adminReview.ts";
import { authRoutes } from "./routes/auth.ts";
import { chatRoutes } from "./routes/chat.ts";
import { clockRoutes, requestRoutes } from "./routes/clocks.ts";
import { exportRoutes } from "./routes/exports.ts";
import { exposureRoutes } from "./routes/exposure.ts";
import { policyRoutes } from "./routes/policies.ts";
import { postureRoutes } from "./routes/posture.ts";
import { valueRoutes } from "./routes/value.ts";

export const app = new Hono<AppEnv>().basePath("/api");

/**
 * The store starts empty on a fresh deploy, so the demo organisation and its
 * two accounts are seeded on the first request that needs them. It is a no-op
 * once the store has a user, and it is serialised here so two cold starts
 * arriving together cannot seed twice.
 */
let seeding: Promise<void> | null = null;
app.use("*", async (c, next) => {
  if (!seeding) seeding = ensureSeeded().catch((err) => {
    seeding = null;
    throw err;
  });
  await seeding;
  await next();
});

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/chat", chatRoutes);
app.route("/clocks", clockRoutes);
app.route("/exports", exportRoutes);
app.route("/exposure", exposureRoutes);
app.route("/policies", policyRoutes);
app.route("/posture", postureRoutes);
app.route("/requests", requestRoutes);
app.route("/value", valueRoutes);
app.route("/admin", adminAuditRoutes);
app.route("/admin", adminRoutes);
app.route("/admin", adminEscalationRoutes);
app.route("/admin", adminExportRoutes);
app.route("/admin", adminExposureRoutes);
app.route("/admin", adminPolicyRoutes);
app.route("/admin", adminPostureRoutes);
app.route("/admin", adminRecordRoutes);
app.route("/admin", adminReviewRoutes);

app.notFound((c) => c.json({ error: "Not found" }, 404));

app.onError((err, c) => {
  console.error(`[api] ${c.req.method} ${c.req.path}:`, err);
  return c.json({ error: "Something went wrong. Please try again." }, 500);
});
