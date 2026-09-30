/**
 * Compliance Documents: turning `OrgDoc` into the three-section
 * `DocumentsResponse` the client reads, and the shared rules for what a
 * stored file may be.
 *
 * Policies are never stored here - they are generated from `doc.policies`,
 * the same approved pack the Policy Guide and the area pages read (see
 * lib/policies.ts, lib/workplan.ts). Procedures are generated from
 * `doc.procedures` (WORKPLAN lane), plus anything the operator has filed
 * under "procedures" as a document. Trackers are entirely operator-filed:
 * `doc.documents` matched against the named register list, with an honest
 * "not yet filed" entry for any register nobody has filed yet.
 */

import { AREA_IDS, DOCUMENT_SECTIONS, TRACKER_DOCUMENTS } from "@maximus/shared";
import type { ComplianceDocument, DocumentsResponse } from "@maximus/shared";
import type { DocumentRecord, OrgDoc, PolicyRecord, ProcedureRecord } from "../db/model.ts";
import { latestApprovedPolicies } from "./policies.ts";
import { policyForArea } from "./workplan.ts";

// ---------------------------------------------------------------------------
// The true cap on an uploaded file
// ---------------------------------------------------------------------------

/**
 * `DOCUMENT_MAX_BYTES` in the shared spine (packages/shared/src/tracker.ts)
 * is 10 MB, per the order. That is not what actually reaches this API.
 *
 * The route runs as a Netlify v2 function (see netlify/functions/api.mts),
 * and Netlify's synchronous function invocation - v1 or v2 - buffers the
 * REQUEST body and caps it at 6 MB; only the response may stream past that
 * (docs.netlify.com/build/functions/overview, "Function considerations";
 * confirmed on the Netlify support forum for both v1 and v2 handlers). A
 * file arrives here as base64 inside a JSON body (`documentInputSchema`,
 * `fileBase64`), and base64 inflates raw bytes by 4/3. So the true ceiling
 * on the FILE itself, worked back from the 6 MB request ceiling:
 *
 *   6 MiB request budget
 *   less ~5% for the JSON envelope around it (title, section, area,
 *     version, owner, filename, content type, and HTTP/JSON framing)
 *                                                    ~= 5.98 MiB of base64
 *   5.98 MiB of base64 * 3/4 (base64 -> raw bytes)   ~= 4.49 MiB raw
 *
 * `EFFECTIVE_UPLOAD_MAX_BYTES` is set below that, at a round 4 MB, so an
 * upload that passes this check clears the 6 MB function ceiling with
 * margin to spare rather than sitting right against it. This is smaller
 * than the order's 10 MB; the shared `DOCUMENT_MAX_BYTES` now agrees; see the
 * DOCUMENTS lane report in R01 for the discrepancy against the order. A
 * file over this cap is rejected with a message telling the operator to
 * add it as a link instead - the same instruction the order gives for the
 * 10 MB case, just at the size that actually holds.
 */
export const EFFECTIVE_UPLOAD_MAX_BYTES = 4 * 1024 * 1024;
export const EFFECTIVE_UPLOAD_MAX_MB = EFFECTIVE_UPLOAD_MAX_BYTES / (1024 * 1024);

// ---------------------------------------------------------------------------
// Mapping a stored record onto the client's shape
// ---------------------------------------------------------------------------

function toClientDocument(d: DocumentRecord): ComplianceDocument {
  return {
    id: d.id,
    orgId: d.orgId,
    section: d.section,
    area: d.area,
    title: d.title,
    version: d.version,
    asAt: d.asAt,
    owner: d.owner,
    kind: d.kind,
    blobKey: d.blobKey,
    fileName: d.fileName,
    contentType: d.contentType,
    sizeBytes: d.sizeBytes,
    url: d.url,
    published: d.published,
    updatedAt: d.updatedAt,
    updatedBy: d.updatedBy,
    description: d.description ?? "",
    status: d.status ?? "",
  };
}

/** Which module a policy code belongs to, worked out the same way the area page does. */
function areaOfPolicy(doc: OrgDoc): Map<string, number> {
  const map = new Map<string, number>();
  for (const area of AREA_IDS) {
    const match = policyForArea(doc, area);
    if (match) map.set(match.code, area);
  }
  return map;
}

function policyDocument(p: PolicyRecord, area: number | null, title: string): ComplianceDocument {
  return {
    id: p.id,
    orgId: p.orgId,
    section: "policies",
    area,
    title,
    version: String(p.version),
    asAt: p.approvedAt ? p.approvedAt.slice(0, 10) : "",
    owner: "MITMARK",
    kind: "policy",
    blobKey: null,
    fileName: "",
    contentType: "",
    sizeBytes: 0,
    url: "",
    published: true,
    updatedAt: p.approvedAt ?? p.createdAt,
    updatedBy: "MITMARK",
    description: "",
    status: "approved",
  };
}

/** All approved versions of one policy code, newest first. */
function approvedVersionsOf(doc: OrgDoc, code: string): PolicyRecord[] {
  return doc.policies
    .filter((p) => p.code === code && p.status === "approved")
    .sort((a, b) => b.version - a.version);
}

/**
 * Policies section: the latest approved version of each policy, plus its
 * earlier approved versions as version history, plus anything the operator
 * has filed under "policies" as a document (e.g. a certificate). Drafts
 * never appear - the client never sees a policy MITMARK has not approved.
 */
function policiesSectionItems(doc: OrgDoc): ComplianceDocument[] {
  const latest = latestApprovedPolicies(doc);
  const areaOf = areaOfPolicy(doc);
  const items: ComplianceDocument[] = [];

  for (const policy of latest) {
    const area = areaOf.get(policy.code) ?? null;
    items.push(policyDocument(policy, area, policy.title));
    const earlier = approvedVersionsOf(doc, policy.code).filter((p) => p.id !== policy.id);
    for (const old of earlier) {
      items.push(policyDocument(old, area, `${policy.title} (earlier version)`));
    }
  }

  const filed = doc.documents.filter((d) => d.section === "policies" && d.published);
  items.push(...filed.map(toClientDocument));
  return items;
}

/**
 * Procedures section: the published procedure for each module (WORKPLAN
 * lane's Procedures page), plus anything filed under "procedures" as a
 * document. A procedure with no external link still opens - onto the area
 * page section where its text already lives - so "open" is never a lie.
 */
function procedureDocument(area: number, p: ProcedureRecord): ComplianceDocument {
  return {
    id: p.id,
    orgId: p.orgId ?? "",
    section: "procedures",
    area,
    title: p.title || `Procedure, module ${area}`,
    version: "",
    asAt: p.publishedAt ? p.publishedAt.slice(0, 10) : "",
    owner: "MITMARK",
    kind: "link",
    blobKey: null,
    fileName: "",
    contentType: "",
    sizeBytes: 0,
    url: p.link || `/tracker/areas/${area}#how-we-do-it`,
    published: true,
    updatedAt: p.publishedAt ?? "",
    updatedBy: "MITMARK",
    description: "",
    status: "published",
  };
}

function proceduresSectionItems(doc: OrgDoc): ComplianceDocument[] {
  const items: ComplianceDocument[] = [];
  for (const area of AREA_IDS) {
    const procedure = doc.procedures.find((p) => p.orgId === doc.id && p.area === area);
    if (procedure && procedure.publishedAt) items.push(procedureDocument(area, procedure));
  }
  const filed = doc.documents.filter((d) => d.section === "procedures" && d.published);
  items.push(...filed.map(toClientDocument));
  return items;
}

/**
 * Trackers section: the named register list (`TRACKER_DOCUMENTS`), matched
 * to a filed document by title (case-insensitive) - the admin page's create
 * form offers the register's own title so a filed register always matches.
 * A register nothing has been filed against still appears, honestly marked
 * as not yet filed, rather than being left off the list.
 */
function unfiledTrackerItem(doc: OrgDoc, t: (typeof TRACKER_DOCUMENTS)[number]): ComplianceDocument {
  return {
    id: `tracker-unfiled:${t.key}`,
    orgId: doc.id,
    section: "trackers",
    area: t.area,
    title: t.title,
    version: "",
    asAt: "",
    owner: "",
    kind: "link",
    blobKey: null,
    fileName: "",
    contentType: "",
    sizeBytes: 0,
    url: "",
    published: false,
    updatedAt: "",
    updatedBy: "",
    description: "",
    status: "",
  };
}

function trackersSectionItems(doc: OrgDoc): ComplianceDocument[] {
  const filed = doc.documents.filter((d) => d.section === "trackers" && d.published);
  const matches = (d: DocumentRecord, t: (typeof TRACKER_DOCUMENTS)[number]) =>
    [t.title, ...(t.aliases ?? [])].some((name) => d.title.trim().toLowerCase() === name.trim().toLowerCase());

  const items: ComplianceDocument[] = TRACKER_DOCUMENTS.map((t) => {
    const found = filed.find((d) => matches(d, t));
    return found ? toClientDocument(found) : unfiledTrackerItem(doc, t);
  });

  // A filed register that does not match one of the named six still appears
  // - the operator may publish a register beyond the standard list.
  const extra = filed.filter((d) => !TRACKER_DOCUMENTS.some((t) => matches(d, t)));
  items.push(...extra.map(toClientDocument));
  return items;
}

// ---------------------------------------------------------------------------
// The full response
// ---------------------------------------------------------------------------

const EMPTY_MESSAGE: Record<(typeof DOCUMENT_SECTIONS)[number]["id"], string> = {
  policies: "MITMARK will publish the approved policy pack here once the first policy is approved.",
  procedures: "MITMARK will publish how it does the work for each module here.",
  trackers: "MITMARK will publish the registers here as they are filed.",
};

export function buildDocumentsResponse(doc: OrgDoc): DocumentsResponse {
  const targetDate = doc.settings.documentsTargetDate;
  const sections = DOCUMENT_SECTIONS.map((s) => {
    const items =
      s.id === "policies"
        ? policiesSectionItems(doc)
        : s.id === "procedures"
          ? proceduresSectionItems(doc)
          : trackersSectionItems(doc);
    return {
      id: s.id,
      name: s.name,
      blurb: s.blurb,
      items,
      emptyMessage: EMPTY_MESSAGE[s.id],
      emptyTargetDate: targetDate,
    };
  });
  return { sections };
}
