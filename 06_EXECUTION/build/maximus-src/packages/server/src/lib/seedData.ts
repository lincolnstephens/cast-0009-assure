/**
 * Seed data for the demo organisation. No client name, no officer name and no
 * data subject's personal data appears here. The fifteen Record entries are
 * illustrative: they show the Record's structure, they are not a log of work
 * MITMARK actually did for anyone.
 *
 * Policy bodies, posture domains and illustrative entries are copied
 * faithfully from the reference at
 * 06_EXECUTION/build/app/packages/shared/src/seed.ts (read, not imported -
 * that workspace is separate from this one).
 *
 * `seedAll` is called both from the command-line script (scripts/seed.ts)
 * and, via `ensureSeeded`, from the request path (see app.ts) so a fresh
 * Netlify Blobs store - which starts empty on every new deploy - seeds
 * itself on first request instead of leaving nobody able to sign in.
 */

import bcrypt from "bcryptjs";
import type { DeadlineLabel, RagStatus } from "../db/model.ts";
import {
  ensureOrg,
  mutateOrg,
  mutateUsers,
  newId,
  readOrg,
  readUsers,
  seedMarker,
  setSeedMarker,
} from "../db/store.ts";
import { sarDueAt } from "./deadlines.ts";

const ORG_ID = "demo";
const ORG_NAME = "Demo Organisation";
const CLIENT_EMAIL = "demo@demo.local";
const OFFICER_EMAIL = "operator@demo.local";
const CLIENT_DISPLAY_NAME = "Information Officer";
const OFFICER_DISPLAY_NAME = "MITMARK data compliance officer";

function seedPassword(envVar: "SEED_CLIENT_PASSWORD" | "SEED_OFFICER_PASSWORD"): string {
  const value = process.env[envVar]?.trim();
  return value ? value : "demo";
}

interface SeedUser {
  email: string;
  password: string;
  role: "client" | "mitmark_admin";
  displayName: string;
  orgId: string | null;
}

/**
 * Write every seed account in one store write.
 *
 * The store is eventually consistent, so writing the accounts one at a time
 * (read, modify, write, twice) can lose the first write when the second read
 * has not yet seen it. One read and one write cannot race with itself.
 */
async function upsertUsers(inputs: SeedUser[]): Promise<string[]> {
  const hashed = await Promise.all(
    inputs.map(async (u) => ({ ...u, passwordHash: await bcrypt.hash(u.password, 10) })),
  );
  return mutateUsers((doc) => {
    const created: string[] = [];
    for (const u of hashed) {
      const existing = doc.users.find((x) => x.email === u.email);
      if (existing) {
        existing.passwordHash = u.passwordHash;
        existing.displayName = u.displayName;
        existing.role = u.role;
        existing.orgId = u.orgId;
        continue;
      }
      doc.users.push({
        id: newId(),
        orgId: u.orgId,
        email: u.email,
        passwordHash: u.passwordHash,
        role: u.role,
        displayName: u.displayName,
        createdAt: new Date().toISOString(),
      });
      created.push(u.email);
    }
    return created;
  });
}

// ---------------------------------------------------------------------------
// Six approved policies
// ---------------------------------------------------------------------------

const POLICY_BODIES: Array<[string, string, string]> = [
  [
    "DP-01",
    "Data Protection Policy",
    "This policy sets out how the organisation handles personal data under the UK GDPR and the Data Protection Act 2018. It covers the lawful bases relied on, the rights of data subjects, the organisation’s obligations as a controller, and the route for raising a data protection question. The Information Officer is the first point of contact. MITMARK provides the outsourced Data Protection Officer function and reviews this policy annually.",
  ],
  [
    "DSR-01",
    "Data Subject Rights Procedure",
    "A request from an individual for their own data is answered within one calendar month of receipt. The clock starts on the day the request arrives, however it arrives. The procedure is: acknowledge in writing, confirm identity, run the search checklist across every system holding personal data, review for third-party data and exemptions, redact where required, and respond in a durable format. An extension of two further months is available for complex requests and must be notified within the first month, with reasons.",
  ],
  [
    "BREACH-01",
    "Personal Data Breach Procedure",
    "Any suspected personal data breach is reported to the Information Officer and to MITMARK on the day it is noticed. MITMARK assesses it against the Article 33 threshold. Where the breach is likely to result in a risk to the rights and freedoms of individuals, the ICO is notified within 72 hours of the organisation becoming aware. Where the risk is high, affected individuals are told without undue delay. Every assessment is recorded in the breach register whether or not it is notifiable.",
  ],
  [
    "RET-01",
    "Retention and Deletion Schedule",
    "Personal data is kept only as long as it is needed for the purpose it was collected for, or as long as a legal obligation requires. The schedule states a retention period for each category of data and the trigger that starts it. Data beyond its period is deleted or anonymised on the next scheduled review. Backups are covered by the same schedule, allowing for the backup cycle.",
  ],
  [
    "CCTV-01",
    "CCTV and Surveillance Policy",
    "Camera systems are operated for the stated purposes of safety and the prevention of crime, and for no other purpose. Signage states who operates the system and how to make a request. Footage is retained for 31 days unless it is needed for an investigation or a legal claim, in which case it is exported, logged and held separately. Requests for footage of an identifiable individual are handled under the Data Subject Rights Procedure.",
  ],
  [
    "INTL-01",
    "International Transfer Policy",
    "Personal data is not transferred outside the United Kingdom unless the destination has UK adequacy, or an appropriate safeguard is in place. Where the safeguard is the International Data Transfer Agreement or the UK Addendum to the Standard Contractual Clauses, a transfer risk assessment is completed and kept with the contract. Every processor contract is reviewed for transfers before signature.",
  ],
];

const POLICY_APPROVED_AT = "2026-06-30T10:00:00.000Z";

async function seedPolicies(): Promise<void> {
  await mutateOrg(ORG_ID, (doc) => {
    if (doc.policies.length > 0) {
      console.log("Policies already seeded - skipping");
      return;
    }
    for (const [code, title, bodyMarkdown] of POLICY_BODIES) {
      doc.policies.push({
        id: newId(),
        orgId: ORG_ID,
        code,
        title,
        version: 1,
        status: "approved",
        bodyMarkdown,
        approvedBy: OFFICER_DISPLAY_NAME,
        approvedAt: POLICY_APPROVED_AT,
        createdAt: POLICY_APPROVED_AT,
      });
    }
  });
  console.log(`Seeded policies: ${POLICY_BODIES.length} approved`);
}

// ---------------------------------------------------------------------------
// Five posture domains with a 12-week trend
// ---------------------------------------------------------------------------

const POSTURE_SET_AT = "2026-09-15T09:00:00.000Z";

const POSTURE_DOMAINS: Array<[string, number[], string]> = [
  [
    "Governance and accountability",
    [70, 72, 72, 75, 75, 78, 78, 80, 82, 82, 85, 86],
    "Policy suite approved and on an annual cycle. RoPA current.",
  ],
  [
    "Data subject rights",
    [64, 66, 70, 70, 74, 76, 78, 78, 80, 82, 84, 84],
    "Both requests in the period answered inside the statutory month.",
  ],
  [
    "Security controls",
    [55, 55, 58, 60, 60, 62, 62, 65, 66, 66, 68, 70],
    "Access review outstanding for two systems. Raised with the operator.",
  ],
  [
    "Third parties and transfers",
    [48, 50, 52, 55, 58, 58, 60, 62, 64, 66, 66, 68],
    "Article 28 terms in place for new suppliers; legacy contracts still to review.",
  ],
  [
    "People and training",
    [40, 42, 45, 45, 50, 52, 55, 58, 60, 62, 64, 66],
    "Annual module due. Scheduling with the operator.",
  ],
];

/** The model stores a RAG reading per week, not the illustrative numeric
 * score the reference trend uses for its sparkline. This is the mapping used
 * to derive one from the other: >=75 green, >=50 amber, else red. */
function ragForScore(score: number): RagStatus {
  if (score >= 75) return "green";
  if (score >= 50) return "amber";
  return "red";
}

function domainCode(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

/** The twelve Mondays ending with the Monday of the week POSTURE_SET_AT falls in. */
function weekMondays(): string[] {
  const latestMonday = Date.UTC(2026, 8, 14); // 2026-09-14, a Monday
  const weeks: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(latestMonday - i * 7 * 24 * 60 * 60 * 1000);
    weeks.push(d.toISOString().slice(0, 10));
  }
  return weeks;
}

async function seedPosture(): Promise<void> {
  await mutateOrg(ORG_ID, (doc) => {
    if (doc.posture.length > 0) {
      console.log("Posture already seeded - skipping");
      return;
    }
    const weeks = weekMondays();
    for (const [label, trend, note] of POSTURE_DOMAINS) {
      const domain = domainCode(label);
      doc.posture.push({
        id: newId(),
        orgId: ORG_ID,
        domain,
        label,
        rag: ragForScore(trend[trend.length - 1]),
        note,
        setBy: OFFICER_DISPLAY_NAME,
        setAt: POSTURE_SET_AT,
      });
      trend.forEach((score, i) => {
        doc.postureHistory.push({
          id: newId(),
          orgId: ORG_ID,
          domain,
          weekOf: weeks[i],
          rag: ragForScore(score),
        });
      });
    }
  });
  console.log(`Seeded posture: ${POSTURE_DOMAINS.length} domains with 12-week trend`);
}

// ---------------------------------------------------------------------------
// One open SAR clock
// ---------------------------------------------------------------------------

async function seedClock(): Promise<void> {
  await mutateOrg(ORG_ID, (doc) => {
    if (doc.clocks.length > 0) {
      console.log("Clocks already seeded - skipping");
      return;
    }
    const startedAt = "2026-09-14T09:15:00.000Z";
    const dueAt = sarDueAt(new Date(startedAt)).toISOString();
    const clockId = newId();
    doc.clocks.push({
      id: clockId,
      orgId: ORG_ID,
      intakeId: null,
      kind: "sar_1_month",
      startedAt,
      dueAt,
      closedAt: null,
      closedBy: null,
      outcome: null,
      entryId: null,
    });
    doc.clockEvents.push({
      id: newId(),
      clockId,
      note:
        "Statutory one-month SAR clock started. A former member of staff has asked for a copy of the data held about them.",
      actorId: null,
      createdAt: startedAt,
    });
  });
  console.log("Seeded clocks: 1 open SAR");
}

// ---------------------------------------------------------------------------
// Fifteen illustrative Record entries
// ---------------------------------------------------------------------------

const ILL_ENTRIES: Array<[string, number, string, string, number, DeadlineLabel]> = [
  ["2026-07-03", 8, "Prepared and issued the July threat and data protection report", "Two actions raised, both closed by end of month", 4, ""],
  ["2026-07-08", 12, "Advised on legitimate interests basis for a resident communication", "Answer same day; no consent campaign needed", 1, ""],
  ["2026-07-15", 4, "Handled a subject access request end to end: acknowledgment, search checklist, response letter", "Responded in 19 days against the one-month limit", 6, "DSAR one month"],
  ["2026-07-22", 6, "Reviewed a new CCTV maintenance supplier and issued a UK GDPR Article 28 DPA", "DPA signed before the supplier started on site", 5, "DPA before go-live"],
  ["2026-07-29", 3, "Refreshed the data retention and deletion schedule", "Schedule approved; two legacy categories scheduled for deletion", 10, ""],
  ["2026-08-04", 8, "Prepared and issued the August threat and data protection report", "Flagged a phishing pattern seen at two comparable organisations", 4, ""],
  ["2026-08-11", 5, "Assessed a misdirected email against the ICO notification threshold", "Assessed within 6 hours of report; below threshold, no notification, breach register entry made", 8, "Breach 72 hours"],
  ["2026-08-14", 12, "Answered an insurer questionnaire on data protection controls", "Returned in 3 working days with evidence references", 4, ""],
  ["2026-08-20", 2, "Updated the record of processing activities for the new visitor management system", "RoPA current; one missing legal basis corrected", 8, ""],
  ["2026-08-27", 12, "Advised on retention of leaver HR files", "Written answer with ICO reference", 1, ""],
  ["2026-09-02", 8, "Prepared and issued the September threat and data protection report", "No actions raised", 4, ""],
  ["2026-09-05", 4, "Handled a second subject access request from a former contractor", "Responded in 12 days; third-party data redacted", 6, "DSAR one month"],
  ["2026-09-09", 10, "Reviewed Q3 access change and data request logs ahead of the board briefing", "Two dormant accounts flagged for removal", 6, ""],
  ["2026-09-12", 9, "Prepared the Q3 data protection board briefing and one-page summary", "Delivered for the board pack deadline", 8, "Board or audit date"],
  ["2026-09-15", 12, "Advised on cookie consent for the website refresh", "Banner wording and consent categories supplied", 2, ""],
];

async function seedEntries(): Promise<void> {
  await mutateOrg(ORG_ID, (doc) => {
    if (doc.entries.length > 0) {
      console.log("Illustrative entries already seeded - skipping");
      return;
    }
    for (const [date, line, what, outcome, hours, deadline] of ILL_ENTRIES) {
      doc.entries.push({
        id: newId(),
        orgId: ORG_ID,
        date,
        line,
        what,
        outcome,
        hours,
        deadline,
        reviewer: "MITMARK (illustrative)",
        ill: true,
        reviewed: true,
        source: "manual",
        sourceRef: null,
        createdAt: `${date}T12:00:00.000Z`,
      });
    }
  });
  console.log(`Seeded entries: ${ILL_ENTRIES.length} illustrative`);
}

// ---------------------------------------------------------------------------

export interface SeedOptions {
  /** Wipe this lane's seeded arrays (policies, posture, clocks, entries) and
   * all sessions before reseeding, so a stale demo run starts clean. */
  reset?: boolean;
}

/**
 * Creates (or refreshes) the whole demo dataset: the `demo` organisation,
 * the client and MITMARK admin users, six approved policies, five posture
 * domains with their 12-week trend, one open SAR clock, and the fifteen
 * illustrative Record entries. Safe to call more than once - each part skips
 * itself if it finds data already there, unless `reset` is set.
 */
export async function seedAll(opts: SeedOptions = {}): Promise<void> {
  await ensureOrg(ORG_ID, ORG_NAME);

  if (opts.reset) {
    console.log("Resetting demo data (policies, posture, clocks, entries, sessions)...");
    await mutateOrg(ORG_ID, (doc) => {
      doc.policies = [];
      doc.posture = [];
      doc.postureHistory = [];
      doc.clocks = [];
      doc.clockEvents = [];
      doc.entries = [];
    });
    await mutateUsers((doc) => {
      doc.sessions = [];
    });
  }

  if (!process.env.SEED_CLIENT_PASSWORD?.trim() || !process.env.SEED_OFFICER_PASSWORD?.trim()) {
    console.log(
      "SEED_CLIENT_PASSWORD / SEED_OFFICER_PASSWORD not set - falling back to the demo password for both accounts.",
    );
  }
  const clientPassword = seedPassword("SEED_CLIENT_PASSWORD");
  const officerPassword = seedPassword("SEED_OFFICER_PASSWORD");

  await upsertUsers([
    {
      email: CLIENT_EMAIL,
      password: clientPassword,
      role: "client",
      displayName: CLIENT_DISPLAY_NAME,
      orgId: ORG_ID,
    },
    {
      email: OFFICER_EMAIL,
      password: officerPassword,
      role: "mitmark_admin",
      displayName: OFFICER_DISPLAY_NAME,
      orgId: ORG_ID,
    },
  ]);

  await seedPolicies();
  await seedPosture();
  await seedClock();
  await seedEntries();

  console.log("");
  console.log("Seed complete. Sign in with:");
  console.log(`  client        ${CLIENT_EMAIL}`);
  console.log(`  mitmark_admin ${OFFICER_EMAIL}`);
}

/**
 * Call on every request. A no-op once the users document has at least one
 * user; otherwise runs the full seed. This is what lets a Netlify Blobs
 * store - empty on every fresh deploy - seed itself on first request so
 * there is someone to sign in as, instead of leaving the deployed demo
 * unusable until someone runs the CLI script by hand.
 *
 * Note: this does not lock against concurrent first requests. A demo build
 * seeing two simultaneous cold requests could in principle seed twice; each
 * part of seedAll is close to idempotent (upsertUser updates rather than
 * duplicates, the array-based seeds skip when already populated), so the
 * worst case is harmless, not corrupt, data.
 */
export async function ensureSeeded(): Promise<void> {
  // The guard checks what the product actually needs: the organisation, and
  // both accounts. A first request that fails partway can leave a half-written
  // store, and a guard that only counted users would never repair it. seedAll
  // upserts by email and skips sections that are already populated, so calling
  // it again on a partial store completes it rather than duplicating it.
  // A marker written at the end of a successful seed is the first and cheapest
  // check. Once it is there nothing else is read and nothing is ever written
  // again, so a store that has been seeded can never be re-seeded over the top
  // of the operator's work.
  if (await seedMarker()) return;

  const usersDoc = await readUsers();
  const org = await readOrg(ORG_ID);
  const emails = new Set(usersDoc.users.map((u) => u.email));
  const complete = Boolean(org) && emails.has(CLIENT_EMAIL) && emails.has(OFFICER_EMAIL);
  if (complete) {
    await setSeedMarker();
    return;
  }
  await seedAll();
  await setSeedMarker();
}
