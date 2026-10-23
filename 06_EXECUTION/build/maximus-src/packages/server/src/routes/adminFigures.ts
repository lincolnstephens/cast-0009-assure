import { Hono } from "hono";
import { MODULE_FIGURES, areaName, figuresInputSchema } from "@maximus/shared";
import type { ModuleFiguresRecord } from "../db/model.ts";
import { mutateOrg, newId, readOrg } from "../db/store.ts";
import { writeAudit } from "../lib/audit.ts";
import { adminOrgOf, requireAuth, requireRole, type AppEnv } from "../lib/middleware.ts";
import { latestFigures } from "../lib/modulePage.ts";

/**
 * Figures (FRAGO 06 3.3). The counts the operator reports for modules 5, 7
 * and 8, for what the product does not yet hold as records: impact
 * assessments, project risk assessments, vendors and incidents. Operators
 * only. Each save is a new report, kept with who made it and when; the
 * client's page shows the newest with its date.
 */
export const adminFigureRoutes = new Hono<AppEnv>();
adminFigureRoutes.use("/figures", requireAuth, requireRole("mitmark_admin"));
adminFigureRoutes.use("/figures/*", requireAuth, requireRole("mitmark_admin"));

const FIGURE_AREAS = Object.keys(MODULE_FIGURES).map(Number);

adminFigureRoutes.get("/figures", async (c) => {
  const doc = await readOrg(adminOrgOf(c));
  if (!doc) return c.json({ error: "Organisation not found" }, 404);
  const modules = FIGURE_AREAS.map((area) => {
    const latest = latestFigures(doc, area);
    return {
      area,
      name: areaName(area),
      groups: MODULE_FIGURES[area],
      latest: latest
        ? { groups: latest.groups, enteredByName: latest.enteredByName, enteredAt: latest.enteredAt }
        : null,
    };
  });
  return c.json({ modules });
});

adminFigureRoutes.put("/figures/:area", async (c) => {
  const orgId = adminOrgOf(c);
  const user = c.get("user");
  const area = Number(c.req.param("area"));
  const defs = MODULE_FIGURES[area];
  if (!defs) return c.json({ error: "Figures are kept for modules 5, 7 and 8 only." }, 404);

  const parsed = figuresInputSchema.safeParse(await c.req.json().catch(() => null));
  if (!parsed.success) return c.json({ error: "Give each count as a whole number, or leave it empty." }, 400);

  // Only the named counts are kept; anything else in the body is ignored.
  const groups: ModuleFiguresRecord["groups"] = {};
  for (const g of defs) {
    const sent = parsed.data.groups[g.key] ?? {};
    groups[g.key] = Object.fromEntries(g.items.map((i) => [i.key, sent[i.key] ?? null]));
  }

  const record: ModuleFiguresRecord = {
    id: newId(),
    area,
    groups,
    enteredById: user.id,
    enteredByName: user.displayName,
    enteredAt: new Date().toISOString(),
  };
  if (!(await readOrg(orgId))) return c.json({ error: "Organisation not found" }, 404);
  await mutateOrg(orgId, (doc) => {
    doc.figures ??= [];
    doc.figures.push(record);
  });

  await writeAudit({
    orgId,
    actorId: user.id,
    actorName: user.displayName,
    action: "figures.report",
    detail: `Figures reported for module ${area}.`,
  });
  return c.json({ latest: { groups, enteredByName: record.enteredByName, enteredAt: record.enteredAt } });
});
