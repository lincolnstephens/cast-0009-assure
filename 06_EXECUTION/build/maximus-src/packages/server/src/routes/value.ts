import { Hono } from "hono";
import { readOrg } from "../db/store.ts";
import {
  applyFilter,
  clientVisible,
  periodsOf,
  forClient,
  moduleViews,
  statementOf,
  statementOutlook,
  totalsOf,
} from "../lib/record.ts";
import { requireAuth, requireClientSeat, type AppEnv } from "../lib/middleware.ts";

/**
 * The client portal's Value section: the Record, read only, and the Statement.
 * Both draw on reviewed entries. Illustrative entries reach the client only
 * when the operator has switched on "show illustrative" for a demo, and then
 * the response says so and the portal shows the banner.
 */
export const valueRoutes = new Hono<AppEnv>();
valueRoutes.use("*", requireAuth, requireClientSeat);

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
  const areaRaw = Number(c.req.query("module"));
  const area = Number.isInteger(areaRaw) && areaRaw >= 1 && areaRaw <= 8 ? areaRaw : undefined;

  const entries = applyFilter(visible, { period, area });
  // The archive's line statuses are history on the operator's side only.
  const { lineStatus: _archive, ...settings } = doc.settings;
  void _archive;

  return c.json({
    entries: entries.map(forClient),
    totals: totalsOf(entries, doc.settings),
    periods: available,
    period: period || "all periods",
    settings,
    modules: moduleViews(doc),
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

  const statement = statementOf(entries, doc.settings, period || "all periods", new Date(), statementOutlook(doc));
  return c.json({
    ...statement,
    deadlines: statement.deadlines.map(forClient),
    items: statement.items.map(forClient),
  });
});
