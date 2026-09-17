import { Hono } from "hono";
import { readOrg, readUsers } from "../db/store.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

export const exposureRoutes = new Hono<AppEnv>();
exposureRoutes.use("*", requireAuth, requireRole("client"));

function byCreatedDesc<T extends { createdAt: string }>(a: T, b: T): number {
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
}

/**
 * Read-only exposure feed - newest first, scoped to the client's
 * organisation. Every alert is demo data (db/model.ts: `demo` is always
 * true in this build) and the response says so; it is never presented as
 * live monitoring.
 */
exposureRoutes.get("/", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ officerName: "your compliance officer", alerts: [] });
  const doc = await readOrg(user.clientAccountId);

  const usersDoc = await readUsers();
  const officer = usersDoc.users.find((u) => u.role === "mitmark_admin");

  return c.json({
    officerName: officer?.displayName ?? "your compliance officer",
    alerts: (doc?.alerts ?? []).slice().sort(byCreatedDesc).map((a) => ({
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
