import { Hono } from "hono";
import { readOrg } from "../db/store.ts";
import {
  applyFilter,
  clientVisible,
  periodsOf,
  serviceLineViews,
  statementOf,
  obligationsLine,
  totalsOf,
} from "../lib/record.ts";
import { requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";

/**
 * The client portal's Value section: the Record, read only, and the Statement.
 * Both draw on reviewed entries. Illustrative entries reach the client only
 * when the operator has switched on "show illustrative" for a demo, and then
 * the response says so and the portal shows the banner.
 */
export const valueRoutes = new Hono<AppEnv>();
valueRoutes.use("*", requireAuth, requireRole("client"));

function periodParam(raw: string | undefined, available: string[]): string {
  if (raw && raw !== "all" && available.includes(raw)) return raw;
  if (raw === "all") return "";
  return available[0] ?? "";
}

valueRoutes.get("/record", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  const visible = clientVisible(doc);
  const available = periodsOf(visible);
  const period = periodParam(c.req.query("period"), available);
  const lineRaw = Number(c.req.query("line"));
  const line = Number.isInteger(lineRaw) && lineRaw >= 1 && lineRaw <= 12 ? lineRaw : undefined;

  const entries = applyFilter(visible, { period, line });

  return c.json({
    entries,
    totals: totalsOf(entries, doc.settings),
    periods: available,
    period: period || "all periods",
    settings: doc.settings,
    lines: serviceLineViews(doc),
    showingIllustrative: doc.settings.showIllustrative && visible.some((e) => e.ill),
  });
});

valueRoutes.get("/statement", async (c) => {
  const user = c.get("user");
  if (!user.clientAccountId) return c.json({ error: "No organisation" }, 403);
  const doc = await readOrg(user.clientAccountId);
  if (!doc) return c.json({ error: "No organisation" }, 404);

  const visible = clientVisible(doc);
  const available = periodsOf(visible);
  const period = periodParam(c.req.query("period"), available);
  const entries = applyFilter(visible, { period });

  return c.json(
    statementOf(entries, doc.settings, period || "all periods", new Date(), obligationsLine(doc)),
  );
});
