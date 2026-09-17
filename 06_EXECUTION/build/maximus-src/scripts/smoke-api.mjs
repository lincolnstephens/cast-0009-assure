/**
 * Local smoke test of the API, without Netlify and without a credential.
 *
 * Seeds a temporary store, signs in as both accounts, and checks the surfaces
 * the definition of done depends on: the Record, the Statement, the illustrative
 * rule, and that a closed clock creates a Record entry.
 *
 * Usage: node scripts/smoke-api.mjs
 */

import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const dir = mkdtempSync(path.join(os.tmpdir(), "assure-smoke-"));
process.env.ASSURE_DATA_DIR = dir;
process.env.SESSION_SECRET = "smoke-test-secret-not-used-anywhere-else";
delete process.env.NETLIFY_BLOBS_CONTEXT;
delete process.env.NETLIFY;

const { app } = await import("../packages/server/src/app.ts");

let failures = 0;
function check(name, ok, detail = "") {
  console.log((ok ? "PASS " : "FAIL ") + name + (detail ? "  " + detail : ""));
  if (!ok) failures += 1;
}

const BASE = "http://localhost/api";
let cookies = "";

async function call(method, urlPath, body) {
  const init = { method, headers: {} };
  if (cookies) init.headers.cookie = cookies;
  if (body !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  const res = await app.fetch(new Request(BASE + urlPath, init));
  const setCookie = res.headers.get("set-cookie");
  if (setCookie) cookies = setCookie.split(";")[0];
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, body: json };
}

async function signIn(email, password) {
  cookies = "";
  const res = await call("POST", "/auth/login", { email, password });
  return res;
}

// --- health and seeding -----------------------------------------------------
const health = await call("GET", "/health");
check("health responds", health.status === 200, `status ${health.status}`);

// --- the Information Officer ------------------------------------------------
const clientLogin = await signIn("demo@demo.local", "demo");
check("Information Officer signs in", clientLogin.status === 200, `status ${clientLogin.status}`);

const me = await call("GET", "/auth/me");
check("me returns the client role", me.body?.user?.role === "client", String(me.body?.user?.role));
check(
  "no tenant colour is forced when none is set",
  typeof me.body?.branding?.colors?.accent === "string",
  String(me.body?.branding?.colors?.accent),
);

const record = await call("GET", "/value/record");
check("record responds", record.status === 200, `status ${record.status}`);
check(
  "record has entries",
  Array.isArray(record.body?.entries) && record.body.entries.length > 0,
  `${record.body?.entries?.length} entries`,
);
check(
  "every entry the client sees has a named reviewer",
  (record.body?.entries ?? []).every((e) => e.reviewer && e.reviewer.trim().length > 0),
  "",
);
check(
  "the twelve service lines are returned",
  (record.body?.lines ?? []).length === 12,
  `${record.body?.lines?.length} lines`,
);

const statement = await call("GET", "/value/statement");
check("statement responds", statement.status === 200, `status ${statement.status}`);
check(
  "statement shows no ratio until the retainer fee is entered",
  statement.body?.fee === null && statement.body?.conRatio === null,
  `fee ${statement.body?.fee}`,
);
check(
  "statement totals derive from the entries",
  typeof statement.body?.totals?.hours === "number" && statement.body.totals.hours > 0,
  `${statement.body?.totals?.hours} hours`,
);

// --- the operator -----------------------------------------------------------
const adminLogin = await signIn("operator@demo.local", "demo");
check("operator signs in", adminLogin.status === 200, `status ${adminLogin.status}`);

const settings = await call("GET", "/admin/settings?org=demo");
check("operator reads settings", settings.status === 200, `status ${settings.status}`);

const setFee = await call("PUT", "/admin/settings?org=demo", { retainer: 2000, lead: "MITMARK contract lead" });
check("operator sets the retainer fee", setFee.status === 200, `status ${setFee.status}`);

const added = await call("POST", "/admin/record?org=demo", {
  date: "2026-09-16",
  line: 8,
  what: "Issued the September threat and data protection report",
  outcome: "No actions raised",
  hours: 4,
  reviewer: "MITMARK data compliance officer",
  deadline: "",
});
check("operator adds a Record entry", added.status === 201, `status ${added.status}`);

const imported = await call("POST", "/admin/record/import?org=demo", {
  settings: { ioRate: 50, dayRate: 700, retainer: 2500 },
  status: { 1: "Live" },
  entries: [
    {
      date: "2026-06-10",
      line: 4,
      what: "Handled a data request",
      outcome: "Answered in 15 days",
      hours: 6,
      deadline: "DSAR one month",
      reviewer: "MITMARK",
      ill: false,
    },
    { date: "not-a-date", line: 4, what: "bad row", hours: 2, reviewer: "MITMARK" },
  ],
});
check("v0.1 export imports", imported.status === 200, `status ${imported.status}`);
check(
  "import takes the good row and reports the bad one",
  imported.body?.imported === 1 && imported.body?.skipped === 1,
  `imported ${imported.body?.imported}, skipped ${imported.body?.skipped}`,
);

// --- the illustrative rule --------------------------------------------------
const off = await call("PUT", "/admin/settings?org=demo", { showIllustrative: false });
check("operator switches illustrative off", off.status === 200, `status ${off.status}`);

await signIn("demo@demo.local", "demo");
const recordOff = await call("GET", "/value/record");
check(
  "no illustrative entry reaches the client with the switch off",
  (recordOff.body?.entries ?? []).every((e) => e.ill === false),
  `${(recordOff.body?.entries ?? []).filter((e) => e.ill).length} illustrative entries visible`,
);
const statementOff = await call("GET", "/value/statement");
check(
  "statement is not marked illustrative with the switch off",
  statementOff.body?.illustrative === false,
  String(statementOff.body?.illustrative),
);
check(
  "statement shows the ratio once the fee is entered",
  typeof statementOff.body?.conRatio === "number",
  `ratio ${statementOff.body?.conRatio}`,
);

// --- a closed clock becomes a Record entry ----------------------------------
await signIn("demo@demo.local", "demo");
const raised = await call("POST", "/requests", {
  type: "data_request",
  details: "A former member of staff has asked for a copy of their data.",
});
check("the officer can raise a request", raised.status === 200 || raised.status === 201, `status ${raised.status}`);

await signIn("operator@demo.local", "demo");
const clocks = await call("GET", "/admin/clocks?accountId=demo");
const open = (clocks.body?.clocks ?? []).find((c) => !c.closedAt);
check("an open clock is listed for the operator", Boolean(open), `${clocks.body?.clocks?.length} clocks`);

if (open) {
  const before = await call("GET", "/admin/record?org=demo");
  const closed = await call("POST", `/admin/clocks/${open.id}/close`, {
    outcome: "Responded in 14 days against the one-month limit",
    insideStatute: true,
  });
  check("the operator closes the clock", closed.status === 200, `status ${closed.status}`);
  const after = await call("GET", "/admin/record?org=demo");
  const added = (after.body?.entries ?? []).length - (before.body?.entries ?? []).length;
  check("closing the clock creates exactly one Record entry", added === 1, `${added} added`);
  const fromClock = (after.body?.entries ?? []).find((e) => e.source === "clock");
  check(
    "the entry names the operator who closed it and links to the clock",
    Boolean(fromClock && fromClock.reviewer && fromClock.sourceRef === open.id),
    fromClock ? `reviewer ${fromClock.reviewer}` : "no clock entry",
  );
}

// --- the review queue carries what the operator's screen renders -----------
// A pending item with no context used to take the whole admin workspace down.
const queue = await call("GET", "/admin/review?accountId=demo");
check("review queue responds", queue.status === 200, `status ${queue.status}`);
const items = queue.body?.items ?? queue.body ?? [];
const list = Array.isArray(items) ? items : [];
check("the raised request is waiting in the review queue", list.length > 0, `${list.length} items`);
check(
  "every pending item carries a context object",
  list.every((i) => i.context && typeof i.context === "object"),
  "",
);
const intakeItem = list.find((i) => i.type === "intake");
check(
  "an intake item names its type and its source",
  Boolean(intakeItem && intakeItem.context.intakeType && intakeItem.context.source),
  intakeItem ? String(intakeItem.context.intakeType) : "no intake item",
);

// --- the Compliance Tracker -------------------------------------------------
await signIn("operator@demo.local", "demo");
// The seed already applies the library, so a fresh organisation opens on a
// working tracker. Applying it again must therefore be purely additive.
const seeded = await call("GET", "/admin/workplan?org=demo");
check(
  "the seeded organisation already has a workplan",
  (seeded.body?.tasks ?? []).length > 0,
  `${seeded.body?.tasks?.length} tasks`,
);

const applied = await call("POST", "/admin/workplan/apply-library?org=demo", {
  startDate: "2026-09-01",
});
check("the library applies to an organisation", applied.status === 200, `status ${applied.status}`);
check(
  "re-applying adds nothing and overwrites nothing",
  (applied.body?.created ?? -1) === 0 && (applied.body?.skipped ?? 0) > 0,
  `created ${applied.body?.created}, skipped ${applied.body?.skipped}`,
);

const fresh = await call("POST", "/admin/workplan/apply-library?org=demo", {
  startDate: "2027-01-04",
});
check(
  "applying from a later date adds that cycle's tasks",
  (fresh.body?.created ?? 0) > 0,
  `${fresh.body?.created} created`,
);

await signIn("demo@demo.local", "demo");
const home = await call("GET", "/tracker/home");
check("the tracker home responds", home.status === 200, `status ${home.status}`);
check("the home is no longer empty", home.body?.empty === false, String(home.body?.empty));
check("eight areas are returned", (home.body?.areas ?? []).length === 8, `${home.body?.areas?.length}`);
check("five phases are returned", (home.body?.phases ?? []).length === 5, `${home.body?.phases?.length}`);
check("six measures are returned", (home.body?.kpis ?? []).length === 6, `${home.body?.kpis?.length}`);
check(
  "every measure states its basis",
  (home.body?.kpis ?? []).every((k) => typeof k.basis === "string" && k.basis.length > 10),
  "",
);
check(
  "the overall figure never shows a percentage without its fraction",
  !/\d+%/.test(home.body?.overall?.sentence ?? "") ||
    /\d+ of \d+/.test(home.body?.overall?.sentence ?? ""),
  home.body?.overall?.sentence ?? "",
);
check(
  "the denominator counts only what has fallen due",
  typeof home.body?.overall?.m === "number" && home.body.overall.m >= 0,
  `${home.body?.overall?.n} of ${home.body?.overall?.m}`,
);
check(
  "tasks are waiting for the client",
  (home.body?.forYou ?? []).length > 0,
  `${home.body?.forYou?.length} for you`,
);

const areaPage = await call("GET", "/tracker/areas/6");
check("an area page responds", areaPage.status === 200, `status ${areaPage.status}`);
check(
  "the area states the obligation in plain words with the citation at the foot",
  (areaPage.body?.obligation ?? "").length > 80 && (areaPage.body?.citation ?? "").length > 5,
  "",
);
check(
  "the obligation body carries no citation",
  !/Article\s*\d/i.test(areaPage.body?.obligation ?? ""),
  "",
);
check("the area lists its tasks", (areaPage.body?.tasks ?? []).length > 0, `${areaPage.body?.tasks?.length}`);

// The client may confirm a task of their own, and nothing else.
const mine = (home.body?.forYou ?? [])[0];
const confirmed = await call("POST", `/tracker/tasks/${mine.id}/confirm`, {
  note: "Done on our side.",
  evidence: "",
});
check("the client can confirm a task assigned to them", confirmed.status === 200, `status ${confirmed.status}`);

await signIn("operator@demo.local", "demo");
const afterConfirm = await call("GET", "/admin/workplan?org=demo");
const confirmedTask = (afterConfirm.body?.tasks ?? []).find((t) => t.id === mine.id);
check(
  "confirming does not change the status; the operator still owns it",
  confirmedTask && confirmedTask.status !== "done" && confirmedTask.clientConfirmedAt,
  confirmedTask ? `status ${confirmedTask.status}` : "task not found",
);
const queueAfter = await call("GET", "/admin/review?accountId=demo");
check(
  "the confirmation reaches the operator's review queue",
  (queueAfter.body?.items ?? []).some((i) => i.type === "task_confirmation"),
  "",
);

// The client may not touch MITMARK's own work.
const mitmarkTask = (afterConfirm.body?.tasks ?? []).find((t) => t.ownerType === "mitmark");
await signIn("demo@demo.local", "demo");
const refused = await call("POST", `/tracker/tasks/${mitmarkTask.id}/confirm`, { note: "", evidence: "" });
check(
  "the client cannot confirm MITMARK's own work",
  refused.status === 403,
  `status ${refused.status}`,
);

// The operator answers the confirmation: reopening clears the client's claim,
// accepting closes the task and books the work.
await signIn("operator@demo.local", "demo");
const queueItems = (queueAfter.body?.items ?? []).filter((i) => i.type === "task_confirmation");
const reopened = await call("POST", `/admin/review/${queueItems[0].id}/reject`, { note: "Not yet." });
check("the operator can reopen a confirmation", reopened.status === 200, `status ${reopened.status}`);
const afterReopen = await call("GET", "/admin/workplan?org=demo");
const reopenedTask = (afterReopen.body?.tasks ?? []).find((t) => t.id === mine.id);
check(
  "reopening clears the client's claim and leaves the task open",
  reopenedTask && reopenedTask.clientConfirmedAt === null && reopenedTask.status !== "done",
  reopenedTask ? `confirmedAt ${reopenedTask.clientConfirmedAt}` : "not found",
);

await signIn("demo@demo.local", "demo");
await call("POST", `/tracker/tasks/${mine.id}/confirm`, { note: "Done now.", evidence: "" });
await signIn("operator@demo.local", "demo");
const queue2 = await call("GET", "/admin/review?accountId=demo");
const item2 = (queue2.body?.items ?? []).find((i) => i.type === "task_confirmation");
const beforeAccept = await call("GET", "/admin/record?org=demo");
const accepted = await call("POST", `/admin/review/${item2.id}/approve`, {});
check("the operator can accept a confirmation", accepted.status === 200, `status ${accepted.status}`);
const afterAccept = await call("GET", "/admin/workplan?org=demo");
const acceptedTask = (afterAccept.body?.tasks ?? []).find((t) => t.id === mine.id);
check(
  "accepting closes the task",
  acceptedTask && acceptedTask.status === "done",
  acceptedTask ? acceptedTask.status : "not found",
);
const recordAfterAccept = await call("GET", "/admin/record?org=demo");
check(
  "accepting books the work on the Record once",
  (recordAfterAccept.body?.entries ?? []).length - (beforeAccept.body?.entries ?? []).length === 1,
  `${(recordAfterAccept.body?.entries ?? []).length - (beforeAccept.body?.entries ?? []).length} added`,
);

// Closing a task books the work on the Record.
await signIn("operator@demo.local", "demo");
const beforeClose = await call("GET", "/admin/record?org=demo");
const toClose = (afterConfirm.body?.tasks ?? []).find(
  (t) => t.ownerType === "mitmark" && t.status !== "done",
);
const closedTask = await call("PATCH", `/admin/workplan/${toClose.id}?org=demo`, { status: "done" });
check("the operator can close a task", closedTask.status === 200, `status ${closedTask.status}`);
const afterClose = await call("GET", "/admin/record?org=demo");
check(
  "closing a task creates exactly one Record entry",
  (afterClose.body?.entries ?? []).length - (beforeClose.body?.entries ?? []).length === 1,
  `${(afterClose.body?.entries ?? []).length - (beforeClose.body?.entries ?? []).length} added`,
);

// The statement opens with where the client stands.
await signIn("demo@demo.local", "demo");
const stmt2 = await call("GET", "/value/statement");
check(
  "the statement carries the obligations line from the tracker",
  stmt2.body?.obligations && /\d+ of \d+/.test(stmt2.body.obligations.sentence),
  stmt2.body?.obligations?.sentence ?? "absent",
);

rmSync(dir, { recursive: true, force: true });
console.log(failures === 0 ? "\nSMOKE PASS" : `\nSMOKE FAIL: ${failures} checks failed`);
process.exit(failures === 0 ? 0 : 1);
