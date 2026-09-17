import type { AuditRecord } from "../db/model.ts";
import { mutateOrg, newId } from "../db/store.ts";

/**
 * NEW call signature (see PORTING_BRIEF.md and the AUTH lane report for the
 * detail). The Postgres build had one global `audit_log` table and called
 * `writeAudit(db, { clientAccountId, actorId, action, entity, entityId, detail })`.
 * The store has no global table: audit lives as `OrgDoc.audit`, one array per
 * organisation. So:
 *  - `db` is gone; there is no handle to pass, the store functions are free.
 *  - `clientAccountId` is renamed `orgId` to match the model.
 *  - `entity` / `entityId` are gone; fold that information into `action`
 *    and/or `detail` text if a caller needs it recorded.
 *  - `detail` is now a plain string (the document is JSON; format any
 *    structured detail as text, e.g. `key=value` pairs), not an object.
 *  - `actorName` is now required. Route handlers already have it on
 *    `c.get("user").displayName`; other callers must resolve it themselves.
 *  - When `orgId` is null (an action with no organisation, e.g. an admin
 *    user's own session events) the call is a no-op: there is no document to
 *    append to. Nothing throws.
 */
export interface AuditEntry {
  orgId: string | null;
  actorId: string | null;
  actorName: string;
  action: string;
  detail?: string;
}

/**
 * Append an entry to the organisation's audit trail. This is the only code
 * path that appends to `OrgDoc.audit` - audit is append-only by construction.
 * Never include message bodies or secrets in `detail`.
 */
export async function writeAudit(entry: AuditEntry): Promise<void> {
  if (!entry.orgId) return;
  const orgId = entry.orgId;
  const record: AuditRecord = {
    id: newId(),
    orgId,
    actorId: entry.actorId,
    actorName: entry.actorName,
    action: entry.action,
    detail: entry.detail ?? "",
    createdAt: new Date().toISOString(),
  };
  await mutateOrg(orgId, (doc) => {
    doc.audit.push(record);
  });
}
