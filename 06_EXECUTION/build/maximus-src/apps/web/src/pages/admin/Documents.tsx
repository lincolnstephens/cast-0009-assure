import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  AREAS,
  DOCUMENT_SECTIONS,
  documentSectionSchema,
  areaName,
} from "@maximus/shared";
import type { ComplianceDocument, DocumentSection } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { formatDateGB } from "../../lib/format";
import { useAdmin } from "../../store/admin";

const SECTION_OPTS = documentSectionSchema.options;

interface TrackerDocumentEntry {
  key: string;
  title: string;
  area: number;
}

/**
 * v1.7. What the admin list carries beyond the client's shape: a client
 * submission's state, supersession, whether Quick questions can read the file
 * (admin side only) and the test-seat flag.
 */
interface AdminDocument extends ComplianceDocument {
  submission?: {
    state: "submitted" | "returned" | "accepted";
    submittedByName: string;
    submittedAt: string;
    note: string;
    returnReason: string;
  };
  supersedes?: string | null;
  supersededBy?: string | null;
  searchable?: "yes" | "no";
  searchNote?: string;
  test?: boolean;
}

const SUBMISSION_LABEL: Record<string, string> = {
  submitted: "Submitted, awaiting your review",
  returned: "Returned to the client",
  accepted: "Accepted",
};

interface DocumentsListResponse {
  documents: AdminDocument[];
  uploadMaxBytes: number;
  uploadMaxMb: number;
  trackerDocuments: TrackerDocumentEntry[];
}

/** Read a File into the base64 string the create/update body carries. */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Unable to read that file."));
    reader.onload = () => {
      const result = reader.result as string;
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * The operator's side of the Compliance Documents repository. Policies are
 * not filed here - they appear under Policies automatically the moment a
 * policy version is approved (see pages/admin/Policies.tsx) - this page
 * files Procedures and Trackers items, upload or link, and publishes or
 * unpublishes them for the client to read.
 */
export function AdminDocumentsPage() {
  const { selectedAccountId } = useAdmin();
  const [list, setList] = useState<DocumentsListResponse | null>(null);
  const [sectionFilter, setSectionFilter] = useState<DocumentSection | "">("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ComplianceDocument | "new" | null>(null);
  // v1.7: a client submission not yet accepted is not filed; it waits in its own group.
  const pendingSubmission = (d: AdminDocument) => !!d.submission && d.submission.state !== "accepted";
  const filed = list ? list.documents.filter((d) => !pendingSubmission(d)) : [];
  const submitted = list ? list.documents.filter(pendingSubmission) : [];

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const params = new URLSearchParams({ org: selectedAccountId });
      if (sectionFilter) params.set("section", sectionFilter);
      const res = await api<DocumentsListResponse>(`/admin/documents?${params}`);
      setList(res);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the documents.");
    }
  }, [selectedAccountId, sectionFilter]);

  useEffect(() => {
    setList(null);
    void load();
  }, [load]);

  async function act(fn: () => Promise<unknown>) {
    try {
      setError(null);
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    }
  }

  if (!selectedAccountId) {
    return <p className="text-[13px] text-hud-muted">No client account selected.</p>;
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-lg font-semibold">Documents</h1>
      <p className="mt-0.5 text-[13px] text-hud-muted">
        The client's Compliance Documents repository: Procedures and Trackers are filed here, by
        upload or link, and published when ready. Policies are not uploaded on this page - the
        Policies section fills itself in automatically from the approved pack the moment a policy
        version is approved (Policies page), version history included.
      </p>
      {list && (
        <p className="mt-1 text-[13px] text-hud-muted">
          Files up to <strong>{list.uploadMaxMb} MB</strong> can be uploaded here. A larger item
          should be added as a link instead - this is the size the deployed function can actually
          carry, smaller than the 10 MB the order names; see the DOCUMENTS lane report.
        </p>
      )}

      {error && (
        <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
            Section
          </span>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value as DocumentSection | "")}
            className="min-w-[200px] rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            <option value="">All sections</option>
            {DOCUMENT_SECTIONS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
        >
          File a document
        </button>
      </div>

      {!list && !error && <p className="mt-4 text-[13px] text-hud-muted">Loading…</p>}
      {submitted.length > 0 && (
        <section data-testid="admin-client-submissions" className="mt-4 rounded border border-hud-line p-4">
          <h2 className="text-[13px] font-semibold">Submitted by the client</h2>
          <p className="mt-0.5 text-[12px] text-hud-muted">
            Nothing here is published or counted until you accept it in the review queue, where you
            choose its section or return it with a reason.
          </p>
          <ul className="mt-2 space-y-2 text-[13px]">
            {submitted.map((d) => (
              <li key={d.id} data-testid="admin-client-submission" className="border-t border-hud-line/50 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{d.title}</span>
                  <span className="text-hud-muted">{d.area ? areaName(d.area) : "All modules"}</span>
                  <span className="text-hud-muted">{SUBMISSION_LABEL[d.submission!.state] ?? d.submission!.state}</span>
                  {d.test && <TestLabel />}
                  <a
                    data-testid="admin-doc-download"
                    href={`/api/admin/documents/${d.id}/download?org=${encodeURIComponent(selectedAccountId)}`}
                    target="_blank"
                    rel="noopener"
                    className="text-[12px] text-hud-accent hover:underline"
                  >
                    {d.kind === "link" ? "Open" : "Download"}
                  </a>
                </div>
                {d.submission!.note && <p className="mt-0.5 text-hud-muted">{d.submission!.note}</p>}
                {d.submission!.state === "returned" && d.submission!.returnReason && (
                  <p className="mt-0.5 text-hud-muted">Reason given: {d.submission!.returnReason}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {list && filed.length === 0 && (
        <p className="mt-4 text-[13px] text-hud-muted">Nothing filed under this section yet.</p>
      )}

      {list && filed.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded border border-hud-line">
          <table data-testid="document-table" className="w-full min-w-[960px] text-left text-[13px]">
            <thead className="border-b border-hud-line bg-hud-panel/60 text-[11px] uppercase tracking-wider text-hud-muted">
              <tr>
                <th className="px-3 py-2">Section</th>
                <th className="px-3 py-2">Module</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Version / as at</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Kind</th>
                <th className="px-3 py-2">Published</th>
                <th className="px-3 py-2">Updated</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filed.map((d) => (
                <tr key={d.id} data-testid="document-row" className="border-b border-hud-line/50 align-top">
                  <td className="whitespace-nowrap px-3 py-2 text-hud-muted">
                    {DOCUMENT_SECTIONS.find((s) => s.id === d.section)?.name ?? d.section}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-hud-muted">
                    {d.area ? areaName(d.area) : "All modules"}
                  </td>
                  <td className="px-3 py-2">
                    {d.title}
                    {d.test && (
                      <span className="ml-2">
                        <TestLabel />
                      </span>
                    )}
                    {d.supersededBy && (
                      <span className="mt-0.5 block text-[11px] text-hud-muted">Superseded by a newer version</span>
                    )}
                    {d.submission && (
                      <span className="mt-0.5 block text-[11px] text-hud-muted">
                        Submitted by the client, accepted
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    {d.version || (d.asAt ? formatDateGB(d.asAt) : " - ")}
                  </td>
                  <td className="px-3 py-2">{d.owner || " - "}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-hud-muted">
                    {d.kind === "file" ? `File (${(d.sizeBytes / 1024).toFixed(0)} KB)` : "Link"}
                    {d.kind === "file" && d.searchable === "no" && (
                      <span
                        data-testid="admin-doc-searchable"
                        title={d.searchNote || "Quick questions cannot read this file."}
                        className="mt-0.5 block text-[11px] text-status-amber"
                      >
                        Not searchable
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">{d.published ? "Published" : "Held back"}</td>
                  <td className="whitespace-nowrap px-3 py-2 text-hud-muted">
                    {d.updatedAt ? formatDateGB(d.updatedAt.slice(0, 10)) : " - "}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col items-start gap-1 text-[12px]">
                      <a
                        data-testid="admin-doc-download"
                        href={`/api/admin/documents/${d.id}/download?org=${encodeURIComponent(selectedAccountId)}`}
                        target="_blank"
                        rel="noopener"
                        className="text-hud-accent hover:underline"
                      >
                        {d.kind === "link" ? "Open" : "Download"}
                      </a>
                      <button className="text-hud-accent hover:underline" onClick={() => setEditing(d)}>
                        Edit
                      </button>
                      <button
                        className="text-hud-accent hover:underline"
                        onClick={() =>
                          void act(async () => {
                            await api(`/admin/documents/${d.id}?org=${selectedAccountId}`, {
                              method: "PATCH",
                              body: JSON.stringify({ published: !d.published }),
                            });
                          })
                        }
                      >
                        {d.published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        className="text-status-red hover:underline"
                        onClick={() =>
                          void act(async () => {
                            if (!window.confirm("Remove this document from the repository?")) return;
                            await api(`/admin/documents/${d.id}?org=${selectedAccountId}`, {
                              method: "DELETE",
                            });
                          })
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && list && (
        <DocumentModal
          orgId={selectedAccountId}
          document={editing === "new" ? null : editing}
          trackerDocuments={list.trackerDocuments}
          uploadMaxBytes={list.uploadMaxBytes}
          uploadMaxMb={list.uploadMaxMb}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            void load();
          }}
        />
      )}
    </div>
  );
}

function DocumentModal({
  orgId,
  document,
  trackerDocuments,
  uploadMaxBytes,
  uploadMaxMb,
  onClose,
  onSaved,
}: {
  orgId: string;
  document: ComplianceDocument | null;
  trackerDocuments: TrackerDocumentEntry[];
  uploadMaxBytes: number;
  uploadMaxMb: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [section, setSection] = useState<DocumentSection>(document?.section ?? "procedures");
  const [area, setArea] = useState(document?.area ? String(document.area) : "");
  const [title, setTitle] = useState(document?.title ?? "");
  const [version, setVersion] = useState(document?.version ?? "");
  const [asAt, setAsAt] = useState(document?.asAt ?? "");
  const [owner, setOwner] = useState(document?.owner ?? "");
  const [kind, setKind] = useState<"file" | "link">(document?.kind === "file" ? "file" : "link");
  const [url, setUrl] = useState(document?.url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [published, setPublished] = useState(document?.published ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const registerOptions = section === "trackers" ? trackerDocuments : [];

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (kind === "file" && file && file.size > uploadMaxBytes) {
      setError(
        `That file is larger than the ${uploadMaxMb} MB this repository can carry. Add it as a link instead.`,
      );
      return;
    }
    if (kind === "file" && !file && !document) {
      setError("Choose a file, or switch to a link.");
      return;
    }
    if (kind === "link" && !url.trim()) {
      setError("Add a link, or switch to a file.");
      return;
    }

    setBusy(true);
    try {
      const body: Record<string, unknown> = {
        section,
        area: area === "" ? null : Number(area),
        title,
        version,
        asAt,
        owner,
        kind,
        published,
      };
      if (kind === "link") {
        body.url = url.trim();
      }
      if (kind === "file" && file) {
        body.fileBase64 = await fileToBase64(file);
        body.fileName = file.name;
        body.contentType = file.type || "application/octet-stream";
      }

      if (document) {
        await api(`/admin/documents/${document.id}?org=${orgId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        await api(`/admin/documents?org=${orgId}`, { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save this document.");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-6"
      onClick={onClose}
    >
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="grid w-full max-w-2xl grid-cols-1 gap-3 rounded border border-hud-line bg-hud-panel p-6 sm:grid-cols-2"
      >
        <h2 className="col-span-1 text-base font-semibold sm:col-span-2">
          {document ? "Edit document" : "File a document"}
        </h2>

        <Field label="Section">
          <select
            value={section}
            onChange={(e) => setSection(e.target.value as DocumentSection)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            {SECTION_OPTS.map((s) => (
              <option key={s} value={s}>
                {DOCUMENT_SECTIONS.find((d) => d.id === s)?.name ?? s}
              </option>
            ))}
          </select>
          {section === "policies" && (
            <span className="mt-1 block text-[11px] text-status-amber">
              The policies themselves, with their version history, publish automatically from the
              approved pack (Policies page) - you cannot file one here. This files something extra
              alongside them, such as a certificate, under the Policies section.
            </span>
          )}
        </Field>

        <Field label="Module">
          <select
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            <option value="">All modules</option>
            {AREAS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.id}. {a.name}
              </option>
            ))}
          </select>
        </Field>

        {registerOptions.length > 0 && (
          <div className="col-span-1 sm:col-span-2">
            <Field label="Register (fills in the title so the client's page matches it)">
              <select
                defaultValue=""
                onChange={(e) => {
                  const picked = registerOptions.find((r) => r.key === e.target.value);
                  if (picked) {
                    setTitle(picked.title);
                    setArea(String(picked.area));
                  }
                }}
                className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
              >
                <option value="">Custom title</option>
                {registerOptions.map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}

        <div className="col-span-1 sm:col-span-2">
          <Field label="Title">
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </Field>
        </div>

        <Field label="Version">
          <input
            type="text"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="e.g. 1.2, leave blank for a register"
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="As at">
          <input
            type="text"
            value={asAt}
            onChange={(e) => setAsAt(e.target.value)}
            placeholder="YYYY-MM-DD, leave blank for a policy"
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>

        <div className="col-span-1 sm:col-span-2">
          <Field label="Owner">
            <input
              type="text"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </Field>
        </div>

        <Field label="Kind">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as "file" | "link")}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            <option value="link">Link</option>
            <option value="file">File upload</option>
          </select>
        </Field>

        {kind === "link" ? (
          <Field label="URL">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </Field>
        ) : (
          <Field label={`File (up to ${uploadMaxMb} MB)`}>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-[13px]"
            />
            {document?.kind === "file" && !file && (
              <span className="mt-1 block text-[11px] text-hud-muted">
                Leave blank to keep the file already stored ({document.fileName}).
              </span>
            )}
          </Field>
        )}

        <div className="col-span-1 sm:col-span-2">
          <label className="flex items-center gap-2 text-[13px]">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            Published, the client can read this
          </label>
        </div>

        {error && (
          <p
            className="col-span-1 border-l-2 border-status-red pl-3 text-[13px] text-status-red sm:col-span-2"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="col-span-1 mt-2 flex justify-end gap-3 sm:col-span-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-[13px] text-hud-muted hover:text-hud-text"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-hud-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
          >
            {busy ? "Saving…" : document ? "Save document" : "File document"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TestLabel() {
  return (
    <span
      data-testid="test-label"
      className="rounded border border-status-amber/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-status-amber"
    >
      Test seat
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[13px]">
      <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">{label}</span>
      {children}
    </label>
  );
}
