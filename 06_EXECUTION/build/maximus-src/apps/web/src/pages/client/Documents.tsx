import { useCallback, useEffect, useState } from "react";
import type { ComplianceDocument, DocumentsResponse } from "@maximus/shared";
import { areaName } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { apiHref } from "../../lib/preview";
import { formatDateGB } from "../../lib/format";
import { PolicyPanel } from "../../components/PolicyPanel";

/**
 * Compliance Documents: the repository (V12_BRIEF.md, FRAGO_02 §4.2). Three
 * sections - Policies, Procedures, Trackers - each showing what the operator
 * has published, and an honest empty or "not yet filed" state for what has
 * not. Read and download only: this page has no create, edit or delete
 * control anywhere, by design - the client confirms a task and does
 * nothing else, and the same rule holds for a document.
 */
export function DocumentsPage() {
  const [data, setData] = useState<DocumentsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openPolicyId, setOpenPolicyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api<DocumentsResponse>("/tracker/documents"));
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
        done, and the registers that record what happened. You can read and download here; MITMARK
        files and publishes everything you see.
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
