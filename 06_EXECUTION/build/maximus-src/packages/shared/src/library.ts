import { libraryTaskSchema, type LibraryTask, type Recurrence } from "./tracker.ts";

/**
 * Tessera Assure's task library.
 *
 * This is the seed of the Compliance Tracker workplan: FRAGO 01 section 8,
 * transcribed task by task. An operator applies it to an organisation with a
 * start date, and `expandLibrary` turns each library task into the dated
 * instances of the workplan for the next twelve months.
 *
 * Owner roles are drawn only from `DEFAULT_CLIENT_ROLES` in `tracker.ts`.
 * MITMARK-owned tasks carry an empty `ownerRole`.
 */

export const LIBRARY_TASKS: LibraryTask[] = [
  // -- Area 1, DPO registration and ICO -------------------------------------
  {
    id: "a1-ico-registration",
    area: 1,
    phase: 1,
    title: "Confirm ICO registration is current and the fee tier is right.",
    how: "MITMARK checks the register entry and tells you the fee tier and renewal date.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "annual",
    defaultHours: 1,
    defaultOffsetDays: 7,
  },
  {
    id: "a1-dpo-appointment",
    area: 1,
    phase: 1,
    title:
      "Confirm DPO appointment is recorded and the DPO contact is on the privacy notice and the ICO record.",
    how: "MITMARK checks the DPO's name and contact details appear correctly wherever they should.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "annual",
    defaultHours: 1,
    defaultOffsetDays: 14,
  },
  {
    id: "a1-ico-fee-payment",
    area: 1,
    phase: 3,
    title: "Register or renew: pay the ICO fee.",
    how: "Finance pays the fee shown on the ICO renewal notice MITMARK forwards.",
    ownerType: "client",
    ownerRole: "Finance",
    recurrence: "annual",
    defaultHours: 0,
    defaultOffsetDays: 35,
  },

  // -- Area 2, Data mapping and processing records --------------------------
  {
    id: "a2-ropa-review",
    area: 2,
    phase: 4,
    title:
      "Maintain the record of processing activities: review every activity, legal basis, retention and recipients.",
    how: "MITMARK works through each processing activity with you and updates the record.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "quarterly",
    defaultHours: 8,
    defaultOffsetDays: 45,
  },
  {
    id: "a2-ropa-new-system",
    area: 2,
    phase: 3,
    title: "Add any new system or supplier to the RoPA before go-live.",
    how: "MITMARK adds the new system or supplier to the record before it goes live.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "always-on",
    defaultHours: 2,
    defaultOffsetDays: 0,
  },
  {
    id: "a2-department-list",
    area: 2,
    phase: 1,
    title: "Confirm the department list and system list are complete.",
    how: "The Information Officer confirms the current department and system list to MITMARK.",
    ownerType: "client",
    ownerRole: "Information Officer",
    recurrence: "annual",
    defaultHours: 0,
    defaultOffsetDays: 10,
  },

  // -- Area 3, Data retention ------------------------------------------------
  {
    id: "a3-retention-schedule-review",
    area: 3,
    phase: 2,
    title: "Review the retention and deletion schedule against operations and law.",
    how: "MITMARK compares what is actually kept against the schedule and the legal minimums.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "annual",
    defaultHours: 10,
    defaultOffsetDays: 28,
  },
  {
    id: "a3-scheduled-deletions",
    area: 3,
    phase: 3,
    title: "Run the scheduled deletions and record them.",
    how: "IT runs the deletions the schedule calls for and confirms they are done.",
    ownerType: "client",
    ownerRole: "IT",
    recurrence: "quarterly",
    defaultHours: 0,
    defaultOffsetDays: 40,
  },
  {
    id: "a3-deletion-verification",
    area: 3,
    phase: 4,
    title: "Verify deletions ran and record the evidence.",
    how: "MITMARK checks IT's deletion confirmation and files the evidence.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "quarterly",
    defaultHours: 2,
    defaultOffsetDays: 55,
  },

  // -- Area 4, Cross-border data transfers -----------------------------------
  {
    id: "a4-transfer-mapping",
    area: 4,
    phase: 1,
    title: "Identify every transfer outside the UK, its mechanism and its risk assessment.",
    how: "MITMARK lists each transfer abroad, its safeguard and its risk level.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "annual",
    defaultHours: 6,
    defaultOffsetDays: 18,
  },
  {
    id: "a4-transfer-safeguards",
    area: 4,
    phase: 3,
    title: "Put the UK Addendum or IDTA in place for any new transfer before it starts.",
    how: "MITMARK puts the correct transfer agreement in place before data leaves the UK.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "always-on",
    defaultHours: 4,
    defaultOffsetDays: 0,
  },

  // -- Area 5, Data protection impact assessments ----------------------------
  {
    id: "a5-dpia-screening",
    area: 5,
    phase: 2,
    title: "Screen every new project or system for DPIA need.",
    how: "MITMARK runs the screening questions against the new project or system.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "always-on",
    defaultHours: 2,
    defaultOffsetDays: 0,
  },
  {
    id: "a5-dpia-completion",
    area: 5,
    phase: 3,
    title: "Complete the DPIA where required, with sign-off and any ICO consultation flag.",
    how: "MITMARK completes the assessment, flags any need to consult the ICO, and gets sign-off.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "always-on",
    defaultHours: 16,
    defaultOffsetDays: 0,
  },
  {
    id: "a5-dpia-approval",
    area: 5,
    phase: 3,
    title: "Approve the DPIA and its residual risk.",
    how: "The Information Officer reviews and approves the assessment MITMARK prepares.",
    ownerType: "client",
    ownerRole: "Information Officer",
    recurrence: "always-on",
    defaultHours: 0,
    defaultOffsetDays: 0,
  },

  // -- Area 6, Data subject requests -----------------------------------------
  {
    id: "a6-dsar-handling",
    area: 6,
    phase: 4,
    title: "Handle every request within one month: acknowledge, search, redact, respond.",
    how: "MITMARK acknowledges the request, gathers and checks the data, and sends the response.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "always-on",
    defaultHours: 6,
    defaultOffsetDays: 0,
  },
  {
    id: "a6-dsar-forwarding",
    area: 6,
    phase: 4,
    title: "Forward any request received by staff to MITMARK the same day.",
    how: "The Information Officer sends any request received by staff to MITMARK the same day.",
    ownerType: "client",
    ownerRole: "Information Officer",
    recurrence: "always-on",
    defaultHours: 0,
    defaultOffsetDays: 0,
  },
  {
    id: "a6-dsar-log-review",
    area: 6,
    phase: 5,
    title: "Review the DSAR log and response times.",
    how: "MITMARK checks the log for requests answered late or nearly late.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "quarterly",
    defaultHours: 2,
    defaultOffsetDays: 60,
  },

  // -- Area 7, Vendor data risk -----------------------------------------------
  {
    id: "a7-vendor-assessment",
    area: 7,
    phase: 3,
    title:
      "Assess every new supplier that processes personal data and put an Article 28 DPA in place before go-live.",
    how: "MITMARK checks the supplier's practices and puts the data processing agreement in place.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "always-on",
    defaultHours: 5,
    defaultOffsetDays: 0,
  },
  {
    id: "a7-vendor-review",
    area: 7,
    phase: 4,
    title: "Review existing suppliers and DPAs, RAG each.",
    how: "MITMARK reviews each supplier's data practices and rates the risk.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "annual",
    defaultHours: 8,
    defaultOffsetDays: 65,
  },
  {
    id: "a7-vendor-notification",
    area: 7,
    phase: 3,
    title: "Notify MITMARK of any new supplier before contract.",
    how: "Facilities tells MITMARK about any new supplier before the contract is signed.",
    ownerType: "client",
    ownerRole: "Facilities",
    recurrence: "always-on",
    defaultHours: 0,
    defaultOffsetDays: 0,
  },

  // -- Area 8, Data breach and incident management -----------------------------
  {
    id: "a8-incident-assessment",
    area: 8,
    phase: 4,
    title:
      "Assess every reported incident against the ICO threshold within 72 hours and record the decision.",
    how: "MITMARK checks the incident against the reporting threshold and records the decision.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "always-on",
    defaultHours: 8,
    defaultOffsetDays: 0,
  },
  {
    id: "a8-breach-notification",
    area: 8,
    phase: 4,
    title: "Notify the ICO and individuals where required.",
    how: "MITMARK notifies the ICO and the people affected where the threshold is met.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "always-on",
    defaultHours: 6,
    defaultOffsetDays: 0,
  },
  {
    id: "a8-incident-reporting",
    area: 8,
    phase: 4,
    title: "Report any suspected incident to MITMARK immediately.",
    how: "The Information Officer passes any suspected incident to MITMARK as soon as it is noticed.",
    ownerType: "client",
    ownerRole: "Information Officer",
    recurrence: "always-on",
    defaultHours: 0,
    defaultOffsetDays: 0,
  },
  {
    id: "a8-incident-response-test",
    area: 8,
    phase: 5,
    title: "Test the incident response plan.",
    how: "MITMARK runs a walkthrough of the incident response plan and notes any gaps.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "annual",
    defaultHours: 6,
    defaultOffsetDays: 300,
  },

  // -- Cross-cutting ------------------------------------------------------------
  {
    id: "a8-staff-training",
    area: 8,
    phase: 3,
    title: "Deliver staff data protection training and record completion.",
    how: "MITMARK delivers the training session and records who attended.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "annual",
    defaultHours: 6,
    defaultOffsetDays: 90,
  },
  {
    id: "a1-board-briefing",
    area: 1,
    phase: 5,
    title: "Prepare the quarterly board briefing on data protection.",
    how: "MITMARK prepares the briefing pack and presents it at the board meeting.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "quarterly",
    defaultHours: 8,
    defaultOffsetDays: 80,
  },
  {
    id: "a8-monthly-report",
    area: 8,
    phase: 5,
    title: "Issue the monthly threat and data protection report.",
    how: "MITMARK compiles the month's threats and data protection activity into the report.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "monthly",
    defaultHours: 4,
    defaultOffsetDays: 20,
  },
  {
    id: "a3-policy-refresh",
    area: 3,
    phase: 2,
    title: "Annual policy suite refresh.",
    how: "MITMARK reviews and reissues the policy suite for the year.",
    ownerType: "mitmark",
    ownerRole: "",
    recurrence: "annual",
    defaultHours: 10,
    defaultOffsetDays: 42,
  },
];

// Validate the library at module load, not just in tests, so a bad edit to
// the list above fails fast wherever it is imported.
for (const task of LIBRARY_TASKS) {
  libraryTaskSchema.parse(task);
}

// ---------------------------------------------------------------------------
// The eight areas' obligations, in plain English, for the area page.
// ---------------------------------------------------------------------------

export interface AreaObligation {
  /** Three to five plain sentences. No legal citations in the body. */
  obligation: string;
  /** The single line naming the article or section, shown at the foot. */
  citation: string;
}

export const AREA_OBLIGATIONS: Record<number, AreaObligation> = {
  1: {
    obligation:
      "Most organisations that handle personal data must register with the Information " +
      "Commissioner's Office and pay the correct annual fee, based on their size and turnover. " +
      "Many organisations must also appoint a Data Protection Officer, or a designated contact " +
      "who takes on that role, and make that person's details available to staff, to individuals " +
      "whose data is held, and to the regulator. Registration and appointment details must be " +
      "kept current and renewed each year. Getting this wrong can mean fines from the regulator " +
      "and a lack of clear accountability for data protection decisions within the organisation.",
    citation: "UK GDPR Article 37; Data Protection (Charges and Information) Regulations 2018",
  },
  2: {
    obligation:
      "Organisations must keep a written record of the personal data they hold, why they hold " +
      "it, the legal basis for holding it, how long they keep it, and who they share it with. " +
      "This record must be reviewed regularly and updated whenever a new system, supplier or " +
      "activity starts processing personal data. It has to be detailed enough to show, at a " +
      "glance, what personal data flows through the organisation and why. Without an accurate " +
      "record, the organisation cannot show the regulator, or itself, that it understands and " +
      "controls its own data.",
    citation: "UK GDPR Article 30",
  },
  3: {
    obligation:
      "Personal data must not be kept for longer than it is needed for the purpose it was " +
      "collected for. Organisations need a retention and deletion schedule that sets out how " +
      "long each type of data is kept and how it is disposed of when that time is up. Deletions " +
      "must actually happen on schedule, not just exist on paper, and the organisation should be " +
      "able to show evidence that they did. Keeping data too long increases risk with no " +
      "benefit, and keeping accurate records of deletion protects the organisation if it is ever " +
      "challenged.",
    citation: "UK GDPR Article 5(1)(e)",
  },
  4: {
    obligation:
      "Personal data may only be sent outside the United Kingdom where the receiving country, " +
      "organisation or contract gives it a suitable level of protection. Organisations must " +
      "identify every transfer of personal data abroad, work out which safeguard applies, and " +
      "assess the risk before the transfer starts. New transfers need the correct legal " +
      "mechanism in place in advance, not after the event. Failing to put safeguards in place " +
      "before data leaves the country is one of the most commonly enforced failures by " +
      "regulators.",
    citation: "UK GDPR Articles 44 to 49",
  },
  5: {
    obligation:
      "Before starting a new project, system or process that is likely to involve significant " +
      "risk to people's personal data, organisations must assess that risk in advance. This " +
      "assessment should describe what is planned, why it is needed, what could go wrong for " +
      "the people involved, and what will be done to reduce that risk. Higher-risk assessments " +
      "need formal sign-off before the project goes ahead, and in the highest-risk cases the " +
      "regulator must be consulted first. Skipping this step means risks are discovered after " +
      "the harm has already happened, rather than before it.",
    citation: "UK GDPR Article 35",
  },
  6: {
    obligation:
      "People have a right to ask what personal data an organisation holds about them, and to " +
      "have it corrected, deleted, or provided to them in some circumstances. These requests " +
      "must be handled within a strict statutory deadline, which starts from the day the " +
      "request is received by anyone in the organisation, not just the privacy team. Staff need " +
      "to recognise a request when it arrives, even an informal one, and pass it on immediately " +
      "so the clock is not lost. Late or mishandled requests are a common source of regulatory " +
      "complaints.",
    citation: "UK GDPR Articles 12 to 23",
  },
  7: {
    obligation:
      "Where a supplier or contractor processes personal data on the organisation's behalf, a " +
      "written contract with specific data protection terms must be in place before that " +
      "supplier starts work. The organisation stays responsible for what its suppliers do with " +
      "personal data, so it must check a new supplier's practices before signing them up, and " +
      "review existing suppliers periodically. Suppliers that pose a higher risk need closer or " +
      "more frequent review. New suppliers should never be given access to personal data before " +
      "this check and the contract are in place.",
    citation: "UK GDPR Article 28",
  },
  8: {
    obligation:
      "When personal data may have been lost, stolen, altered or wrongly shared, the " +
      "organisation has a very short window to decide whether the regulator and the people " +
      "affected need to be told. Every suspected incident must be reported internally the " +
      "moment it is noticed, assessed against the notification threshold, and the decision " +
      "recorded, whether or not it is ultimately reported outward. Where notification is " +
      "required, both the regulator and the affected individuals must be told without undue " +
      "delay. The organisation should also test its incident response plan periodically so " +
      "that, when a real incident happens, people already know what to do.",
    citation: "UK GDPR Articles 33 and 34",
  },
};

// ---------------------------------------------------------------------------
// expandLibrary: library tasks -> dated instances for the next `months`.
// ---------------------------------------------------------------------------

/** A dated instance of a library task, ready for the API lane to turn into a TaskRecord. */
export interface LibraryInstance {
  libraryId: string;
  area: number;
  phase: number;
  title: string;
  how: string;
  ownerType: "mitmark" | "client";
  ownerRole: string;
  recurrence: Recurrence;
  defaultHours: number;
  /** YYYY-MM-DD, or null for an always-on duty. */
  dueAt: string | null;
}

/** Days in a YYYY-MM-DD's month, in UTC, ignoring drift from `Date`'s own rollover. */
function daysInMonthUTC(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate();
}

function parseIsoDate(iso: string): { year: number; month0: number; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month0: m - 1, day: d };
}

function toIsoDate(year: number, month0: number, day: number): string {
  const d = new Date(Date.UTC(year, month0, day));
  return d.toISOString().slice(0, 10);
}

/** Add whole days in UTC. No month or year edge cases to worry about here. */
function addDaysUTC(iso: string, days: number): string {
  const { year, month0, day } = parseIsoDate(iso);
  const ms = Date.UTC(year, month0, day) + days * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * Add whole months in UTC, always measured from the given date, never
 * chained from a previously-adjusted one, so error cannot accumulate.
 *
 * Where the target month is too short for the original day of month, the
 * result clamps to that month's last day: 31 January plus one month is
 * 28 (or 29) February, never a rollover into March.
 */
function addMonthsUTC(iso: string, months: number): string {
  const { year, month0, day } = parseIsoDate(iso);
  const totalMonth0 = month0 + months;
  const targetYear = year + Math.floor(totalMonth0 / 12);
  const targetMonth0 = ((totalMonth0 % 12) + 12) % 12;
  const lastDay = daysInMonthUTC(targetYear, targetMonth0);
  const clampedDay = Math.min(day, lastDay);
  return toIsoDate(targetYear, targetMonth0, clampedDay);
}

/**
 * Turn the task library into the dated workplan instances for the next
 * `months` (default twelve) from `startDate`. The API lane is responsible
 * for turning each instance into a `TaskRecord`; this returns the plain
 * shape only.
 */
export function expandLibrary(
  tasks: LibraryTask[],
  startDate: string,
  months = 12,
): LibraryInstance[] {
  const horizonEnd = addMonthsUTC(startDate, months);
  const instances: LibraryInstance[] = [];

  for (const task of tasks) {
    const base: Omit<LibraryInstance, "dueAt"> = {
      libraryId: task.id,
      area: task.area,
      phase: task.phase,
      title: task.title,
      how: task.how,
      ownerType: task.ownerType,
      ownerRole: task.ownerRole,
      recurrence: task.recurrence,
      defaultHours: task.defaultHours,
    };

    if (task.recurrence === "always-on") {
      // One instance, never dated, never expanded.
      instances.push({ ...base, dueAt: null });
      continue;
    }

    const firstDueAt = addDaysUTC(startDate, task.defaultOffsetDays);

    if (task.recurrence === "once" || task.recurrence === "annual") {
      if (firstDueAt <= horizonEnd) instances.push({ ...base, dueAt: firstDueAt });
      continue;
    }

    const count = task.recurrence === "monthly" ? 12 : 4; // quarterly
    const stepMonths = task.recurrence === "monthly" ? 1 : 3;
    for (let i = 0; i < count; i += 1) {
      const dueAt = addMonthsUTC(firstDueAt, i * stepMonths);
      if (dueAt <= horizonEnd) instances.push({ ...base, dueAt });
    }
  }

  return instances;
}
