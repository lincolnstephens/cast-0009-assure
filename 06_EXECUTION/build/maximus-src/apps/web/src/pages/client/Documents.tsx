import { type FormEvent, useCallback, useEffect, useState } from "react";
import type { ComplianceDocument, DocumentsResponse } from "@maximus/shared";
import { SUBMISSION_CATEGORY_LABEL, areaName, type SubmissionCategory } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { apiHref } from "../../lib/preview";
import { formatDateGB } from "../../lib/format";
import { PolicyPanel } from "../../components/PolicyPanel";
import { usePreviewing } from "../../lib/usePreviewing";

/** v1.7 (FRAGO 07 3.1). One of the client's own submissions, as the page lists it. */
interface Submission {
  id: string;
  title: string;
  area: number | null;
  /** v1.9 (FRAGO 09 3.2). The client's Category; absent on submissions made before v1.9. */
  category?: SubmissionCategory | null;
  kind: "file" | "link" | "policy";
  note: string;
  state: "submitted" | "returned" | "accepted";
  stateLabel: string;
  submittedAt: string;
  decidedAt: string | null;
  returnReason: string;
  supersedesTitle: string | null;
  test: boolean;
}

interface ClientDocumentsResponse extends DocumentsResponse {
  submissions: Submission[];
  replaceable: { id: string; title: string; area: number | null }[];
  uploadMaxMb: number;
  testSeat: boolean;
}

const UPLOAD_READ_ONLY = "Read only in client view. The client uploads documents from her own sign-in.";

/** Read a File into the base64 string the submission body carries. */
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
 * Compliance Documents: the repository (V12_BRIEF.md, FRAGO_02 §4.2). Three
 * sections - Policies, Procedures, Trackers - each showing what the operator
 * has published, and an honest empty or "not yet filed" state for what has
 * not. v1.7 (FRAGO 07 3.1): the client may also offer a document. It is an
 * offer, not a filing: it waits in MITMARK's review queue and nothing is
 * published until MITMARK accepts it. She cannot edit, replace or delete
 * anything once submitted or published; a new version is a new submission.
 */
export function DocumentsPage() {
  const [data, setData] = useState<ClientDocumentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openPolicyId, setOpenPolicyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api<ClientDocumentsResponse>("/tracker/documents"));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load the documents.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) {
    return (
      <p className="border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
        {error}
      </p>
    );
  }

  if (!data) {
    return <p className="text-sm text-client-muted">Loading…</p>;
  }

  return (
    <div className="max-w-4xl" data-testid="documents">
      <h1 className="text-lg font-semibold">Compliance Documents</h1>
      <p className="mt-0.5 text-[13px] text-client-muted">
        What MITMARK has published for this organisation: the approved policies, how the work is
        done, and the registers that record what happened. You can read and download here, and send
        MITMARK a document; MITMARK reviews it and publishes it if it belongs here.
      </p>

      {data.sections.map((section) => (
        <section
          key={section.id}
          data-testid="document-section"
          className="mt-6 rounded border border-client-line bg-client-surface"
        >
          <div className="border-b border-client-line px-4 py-3">
            <h2 className="text-sm font-semibold">{section.name}</h2>
            <p className="mt-0.5 text-[12px] text-client-muted">{section.blurb}</p>
          </div>

          {section.items.length === 0 ? (
            <div className="px-4 py-4 text-[13px] text-client-muted">
              <p>{section.emptyMessage}</p>
              <p className="mt-1">
                {section.emptyTargetDate
                  ? `Target date: ${formatDateGB(section.emptyTargetDate)}`
                  : "No target date has been set yet."}
              </p>
            </div>
          ) : section.id === "policies" ? (
            <PolicyItemList items={section.items} onOpen={setOpenPolicyId} />
          ) : (
            <ul className="divide-y divide-client-line">
              {section.items.map((item) => (
                <DocumentRow key={item.id} item={item} />
              ))}
            </ul>
          )}
        </section>
      ))}

      <UploadPanel data={data} onSubmitted={load} />

      {openPolicyId && (
        <PolicyPanel policyId={openPolicyId} onClose={() => setOpenPolicyId(null)} />
      )}
    </div>
  );
}

/** A stored or generated item's "as at" line: version for a policy, an as-at date for a register. */
function VersionLine({ item }: { item: ComplianceDocument }) {
  const parts: string[] = [];
  if (item.version) {
    parts.push(`Version ${item.version}`);
    // A version number alone does not say how current it is.
    if (item.asAt) parts.push(`approved ${formatDateGB(item.asAt)}`);
  } else if (item.asAt) {
    parts.push(`As at ${formatDateGB(item.asAt)}`);
  }
  if (item.owner) parts.push(item.owner);
  if (parts.length === 0) return null;
  return <p className="mt-0.5 text-[12px] text-client-muted">{parts.join(" · ")}</p>;
}

function OpenControl({ item }: { item: ComplianceDocument }) {
  // Every real stored or generated item the server sends here is already
  // published (see lib/documents.ts) - `published: false` only ever marks
  // one of the honest "not yet filed" placeholders for a named register.
  if (!item.published) {
    return <span className="text-[12px] italic text-client-muted">Not yet filed</span>;
  }
  if (item.kind === "file") {
    return (
      <a
        className="text-[12px] font-medium text-client-accent hover:underline"
        href={apiHref(`/tracker/documents/${item.id}/download`)}
      >
        Download
      </a>
    );
  }
  return (
    <a
      className="text-[12px] font-medium text-client-accent hover:underline"
      href={apiHref(`/tracker/documents/${item.id}/download`)}
      target="_blank"
      rel="noreferrer"
    >
      Open
    </a>
  );
}

function DocumentRow({ item }: { item: ComplianceDocument }) {
  return (
    <li data-testid="document-item" className="px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium text-client-text">{item.title}</span>
        {item.area && (
          <span className="font-mono text-[11px] uppercase tracking-wider text-client-muted">
            {areaName(item.area)}
          </span>
        )}
      </div>
      <VersionLine item={item} />
      {item.description && (
        <p data-testid="document-description" className="mt-0.5 text-[12px] text-client-muted">
          {item.description}
        </p>
      )}
      {item.updatedAt && (
        <p className="mt-0.5 text-[11px] text-client-muted">
          Last updated {formatDateGB(item.updatedAt.slice(0, 10))}
        </p>
      )}
      <div className="mt-1.5">
        <OpenControl item={item} />
      </div>
    </li>
  );
}

/**
 * Policies render grouped: the latest approved version first, its earlier
 * approved versions folded underneath as version history, so the client can
 * see what changed and when without the list reading as several separate
 * documents.
 */
function PolicyItemList({
  items,
  onOpen,
}: {
  items: ComplianceDocument[];
  onOpen: (policyId: string) => void;
}) {
  const groups: { main: ComplianceDocument; history: ComplianceDocument[] }[] = [];
  const other: ComplianceDocument[] = [];

  for (const item of items) {
    if (item.kind !== "policy") {
      other.push(item);
      continue;
    }
    if (item.title.endsWith("(earlier version)") && groups.length > 0) {
      groups[groups.length - 1].history.push(item);
    } else {
      groups.push({ main: item, history: [] });
    }
  }

  return (
    <ul className="divide-y divide-client-line">
      {groups.map((group) => (
        <li key={group.main.id} data-testid="document-item" className="px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-medium text-client-text">{group.main.title}</span>
            {group.main.area && (
              <span className="font-mono text-[11px] uppercase tracking-wider text-client-muted">
                {areaName(group.main.area)}
              </span>
            )}
          </div>
          <VersionLine item={group.main} />
          <div className="mt-1.5">
            <button
              className="text-[12px] font-medium text-client-accent hover:underline"
              onClick={() => onOpen(group.main.id)}
            >
              Open policy
            </button>
          </div>

          {group.history.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-[11px] uppercase tracking-wider text-client-muted">
                Version history ({group.history.length})
              </summary>
              <ul className="mt-1.5 space-y-1.5">
                {group.history.map((old) => (
                  <li key={old.id} data-testid="document-item" className="text-[12px]">
                    <span className="text-client-muted">
                      Version {old.version}
                      {old.asAt ? `, approved ${formatDateGB(old.asAt)}` : ""}
                    </span>{" "}
                    <button
                      className="font-medium text-client-accent hover:underline"
                      onClick={() => onOpen(old.id)}
                    >
                      Open
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </li>
      ))}

      {other.map((item) => (
        <DocumentRow key={item.id} item={item} />
      ))}
    </ul>
  );
}

/**
 * v1.7. "Upload a document" and the client's own submissions. A file up to the
 * cap, or a link; a title, its category and one line of what it is;
 * optionally the published document it is a new version of. v1.9 (FRAGO 09
 * 3.2): the client chooses a Category (Policy, Procedure, Tracker), the way
 * this page is structured; MITMARK sets the module when it accepts.
 */
function UploadPanel({ data, onSubmitted }: { data: ClientDocumentsResponse; onSubmitted: () => Promise<void> }) {
  const previewing = usePreviewing();
  const [kind, setKind] = useState<"file" | "link">("file");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (previewing) return;
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setError(null);
    setDone(false);
    const body: Record<string, unknown> = {
      title: String(form.get("title") ?? "").trim(),
      category: String(form.get("category") ?? ""),
      note: String(form.get("note") ?? "").trim(),
      kind,
      url: "",
      fileBase64: "",
      fileName: "",
      contentType: "",
      supersedes: String(form.get("supersedes") ?? "") || null,
    };
    if (kind === "file") {
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0) {
        setError("Choose a file, or send a link instead.");
        return;
      }
      if (file.size > data.uploadMaxMb * 1024 * 1024) {
        setError(`That file is larger than ${data.uploadMaxMb} MB. Send it as a link instead.`);
        return;
      }
      body.fileBase64 = await fileToBase64(file);
      body.fileName = file.name;
      body.contentType = file.type || "application/octet-stream";
    } else {
      body.url = String(form.get("url") ?? "").trim();
      if (!body.url) {
        setError("Add the link, or send a file instead.");
        return;
      }
    }
    setBusy(true);
    try {
      await api("/tracker/documents", { method: "POST", body: JSON.stringify(body) });
      formEl.reset();
      setKind("file");
      setDone(true);
      await onSubmitted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That did not go through. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const input = "w-full rounded border border-client-line bg-client-bg px-2 py-1.5 text-[13px] disabled:opacity-60";

  return (
    <>
      <section className="mt-6 rounded border border-client-line bg-client-surface">
        <div className="border-b border-client-line px-4 py-3">
          <h2 className="text-sm font-semibold">Upload a document</h2>
          <p className="mt-0.5 text-[12px] text-client-muted">
            Send MITMARK a document for the record. Nothing is published until MITMARK accepts it. Files
            up to {data.uploadMaxMb} MB; send anything larger as a link.
          </p>
        </div>
        <form data-testid="client-upload-form" onSubmit={(e) => void submit(e)} className="grid gap-3 px-4 py-4 sm:grid-cols-2">
          <fieldset disabled={previewing || busy} className="contents">
            <label className="block text-[13px] sm:col-span-2">
              <span className="mb-1 block text-[11px] uppercase tracking-wider text-client-muted">Title</span>
              <input name="title" required maxLength={300} className={input} />
            </label>
            <label className="block text-[13px]">
              <span className="mb-1 block text-[11px] uppercase tracking-wider text-client-muted">Category</span>
              <select name="category" data-testid="upload-category" required defaultValue="" className={input}>
                <option value="" disabled>
                  Choose a category
                </option>
                {(Object.keys(SUBMISSION_CATEGORY_LABEL) as SubmissionCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {SUBMISSION_CATEGORY_LABEL[c]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-[13px]">
              <span className="mb-1 block text-[11px] uppercase tracking-wider text-client-muted">File or link</span>
              <select name="kind" value={kind} onChange={(e) => setKind(e.target.value as "file" | "link")} className={input}>
                <option value="file">A file</option>
                <option value="link">A link</option>
              </select>
            </label>
            <label className="block text-[13px] sm:col-span-2">
              <span className="mb-1 block text-[11px] uppercase tracking-wider text-client-muted">What it is, in one line</span>
              <input name="note" required maxLength={300} className={input} />
            </label>
            {kind === "file" ? (
              <label className="block text-[13px] sm:col-span-2">
                <span className="mb-1 block text-[11px] uppercase tracking-wider text-client-muted">
                  File (up to {data.uploadMaxMb} MB)
                </span>
                <input name="file" type="file" className="w-full text-[13px] disabled:opacity-60" />
              </label>
            ) : (
              <label className="block text-[13px] sm:col-span-2">
                <span className="mb-1 block text-[11px] uppercase tracking-wider text-client-muted">Link</span>
                <input name="url" type="url" placeholder="https://" className={input} />
              </label>
            )}
            {data.replaceable.length > 0 && (
              <label className="block text-[13px] sm:col-span-2">
                <span className="mb-1 block text-[11px] uppercase tracking-wider text-client-muted">
                  This is a new version of (optional)
                </span>
                <select name="supersedes" defaultValue="" className={input}>
                  <option value="">Not a new version</option>
                  {data.replaceable.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
              <button
                type="submit"
                data-testid="client-upload-submit"
                title={previewing ? UPLOAD_READ_ONLY : undefined}
                className="rounded bg-client-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-client-accent/90 disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send to MITMARK"}
              </button>
              {previewing && (
                <span data-testid="client-upload-readonly" className="text-[12px] text-client-muted">
                  {UPLOAD_READ_ONLY}
                </span>
              )}
            </div>
          </fieldset>
          {done && (
            <p role="status" className="text-[13px] text-client-text sm:col-span-2">
              Submitted. Nothing is published until MITMARK accepts it.
            </p>
          )}
          {error && (
            <p role="alert" className="border-l-2 border-status-red pl-3 text-[13px] text-status-red sm:col-span-2">
              {error}
            </p>
          )}
        </form>
      </section>

      <section data-testid="client-submissions" className="mt-6 rounded border border-client-line bg-client-surface">
        <div className="border-b border-client-line px-4 py-3">
          <h2 className="text-sm font-semibold">Your submissions</h2>
          {data.testSeat && (
            <p className="mt-0.5 text-[12px] text-client-muted">Test seat: these are visible to no client.</p>
          )}
        </div>
        {data.submissions.length === 0 ? (
          <p className="px-4 py-4 text-[13px] text-client-muted">Nothing sent yet.</p>
        ) : (
          <ul className="divide-y divide-client-line">
            {data.submissions.map((sub) => (
              <li key={sub.id} data-testid="client-submission" data-state={sub.state} className="px-4 py-3 text-[13px]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-client-text">{sub.title}</span>
                  {(sub.area || sub.category) && (
                    <span className="font-mono text-[11px] uppercase tracking-wider text-client-muted">
                      {sub.area ? areaName(sub.area) : SUBMISSION_CATEGORY_LABEL[sub.category!]}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[12px] text-client-text">{sub.stateLabel}</p>
                {sub.supersedesTitle && (
                  <p className="mt-0.5 text-[12px] text-client-muted">New version of {sub.supersedesTitle}</p>
                )}
                {sub.note && <p className="mt-0.5 text-[12px] text-client-muted">{sub.note}</p>}
                {sub.state === "returned" && sub.returnReason && (
                  <p className="mt-0.5 text-[12px] text-client-text">Reason: {sub.returnReason}</p>
                )}
                <p className="mt-0.5 text-[11px] text-client-muted">Sent {formatDateGB(sub.submittedAt.slice(0, 10))}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
