import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { AreaPage } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { formatDateGB, formatLondon } from "../../lib/format";
import { PolicyPanel } from "../../components/PolicyPanel";
import { ModuleNav } from "../../components/tracker/ModuleNav";
import { RagMark } from "../../components/tracker/RagMark";
import { TaskTable } from "../../components/tracker/TaskTable";

/**
 * One module's page, same skeleton for all eight (FRAGO 03 section 3.4): the
 * name, a short introduction, the relevant documents and trackers, the
 * compliance status as a fraction and a percentage, the task table, then the
 * module sub-navigation so the reader can move on without going back. Below
 * that sits what v1.2 already carried: the obligation with its citation, how
 * the module is delivered, and history. Prints as a clean document via the
 * house `@media print` rules already in index.css.
 */
export function AreaPageView() {
  const { area } = useParams<{ area: string }>();
  const [data, setData] = useState<AreaPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openPolicyId, setOpenPolicyId] = useState<string | null>(null);

  const load = useCallback(async (id: string) => {
    try {
      setData(await api<AreaPage>(`/tracker/areas/${id}`));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load this area.");
    }
  }, []);

  useEffect(() => {
    if (area) {
      setData(null);
      void load(area);
    }
  }, [area, load]);

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

  const history = [...data.history].sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <div className="max-w-4xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted print:hidden">
        <Link to="/tracker" className="hover:text-client-text">
          Compliance Tracker
        </Link>
        <span className="mx-1.5">/</span>
        Area {data.area}
      </p>
      <h1 className="mt-1 text-lg font-semibold">{data.name}</h1>

      <p data-testid="module-intro" className="mt-2 max-w-[75ch] text-[14px] leading-relaxed text-client-text">
        {data.introduction}
      </p>

      <section data-testid="module-documents" className="mt-5" aria-labelledby="module-documents-heading">
        <h2 id="module-documents-heading" className="text-[14px] font-semibold">
          Relevant documents and trackers
        </h2>
        {data.documents.length === 0 ? (
          <p data-testid="module-documents-empty" className="mt-1.5 text-[13px] text-client-muted">
            None filed yet
          </p>
        ) : (
          <ul className="mt-1.5 space-y-1">
            {data.documents.map((d) => (
              <li key={d.id} className="text-[13px]">
                {d.kind === "policy" ? (
                  <button
                    type="button"
                    data-testid="module-doc"
                    onClick={() => setOpenPolicyId(d.id)}
                    className="text-left text-client-accent underline"
                  >
                    {d.title}
                  </button>
                ) : (
                  <a
                    data-testid="module-doc"
                    href={`/api/tracker/documents/${d.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-client-accent underline"
                  >
                    {d.title}
                  </a>
                )}{" "}
                <span className="ml-2 text-[11px] uppercase tracking-wider text-client-muted">
                  {SECTION_LABEL[d.section] ?? d.section}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        data-testid="module-progress-card"
        className="mt-5 rounded border border-client-line bg-client-surface p-4"
      >
        <p
          data-testid="module-progress"
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold text-client-text"
        >
          <span>
            Compliance status: {data.progress.done} of {data.progress.total} done, {data.progress.pct}%
          </span>{" "}
          <RagMark rag={data.status.rag} label={data.status.ragLabel} />
        </p>
        <p className="mt-1.5 text-[12px] text-client-muted">{data.status.basis}</p>
        <p className="mt-0.5 text-[12px] text-client-muted">
          As at {formatDateGB(data.status.asAt)}
        </p>
      </section>

      <section className="mt-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
          Tasks
        </p>
        <div className="mt-2">
          <TaskTable tasks={data.tasks} />
        </div>
      </section>

      <div className="mt-8">
        <ModuleNav />
      </div>

      <section className="mt-10 border-t border-client-line pt-6" data-testid="obligation">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
          What the law asks
        </p>
        <p className="mt-2 max-w-[75ch] text-[14px] leading-relaxed text-client-text">
          {data.obligation}
        </p>
        {data.citation && (
          <p className="mt-2 text-[12px] text-client-muted">{data.citation}</p>
        )}
      </section>

      <section id="how-we-do-it" className="mt-8 scroll-mt-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
          How we do it
        </p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div className="rounded border border-client-line bg-client-surface p-4">
            <p className="text-[11px] uppercase tracking-wider text-client-muted">Policy</p>
            {data.howWeDoIt.policyTitle ? (
              <>
                <p className="mt-1 text-[13px] font-medium text-client-text">
                  {data.howWeDoIt.policyTitle}
                  {data.howWeDoIt.policyCode ? ` (${data.howWeDoIt.policyCode})` : ""}
                </p>
                {data.howWeDoIt.policySection && (
                  <p className="mt-0.5 text-[12px] text-client-muted">
                    Section {data.howWeDoIt.policySection}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-1 text-[13px] text-client-muted">No policy linked yet.</p>
            )}
          </div>

          {data.howWeDoIt.procedurePending ? (
            <div
              data-testid="procedure-pending"
              className="rounded border border-dashed border-status-amber bg-client-surface p-4"
            >
              <p className="font-mono text-[11px] uppercase tracking-wider text-status-amber">
                Procedure to be published by MITMARK
              </p>
              <p className="mt-1.5 text-[13px] text-client-muted">
                {data.howWeDoIt.procedureTargetDate
                  ? `Target date: ${formatDateGB(data.howWeDoIt.procedureTargetDate)}`
                  : "No target date has been set yet."}
              </p>
            </div>
          ) : (
            <div className="rounded border border-client-line bg-client-surface p-4">
              <p className="text-[11px] uppercase tracking-wider text-client-muted">Procedure</p>
              {data.howWeDoIt.procedure ? (
                <>
                  <p className="mt-1 text-[13px] font-medium text-client-text">
                    {data.howWeDoIt.procedure.title}
                  </p>
                  {data.howWeDoIt.procedure.link && (
                    <p className="mt-1 text-[12px]">
                      <a
                        href={data.howWeDoIt.procedure.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-client-accent underline"
                      >
                        Open procedure
                      </a>
                    </p>
                  )}
                  {data.howWeDoIt.procedure.processMapLink && (
                    <p className="mt-1 text-[12px]">
                      <a
                        href={data.howWeDoIt.procedure.processMapLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-client-accent underline"
                      >
                        Open process map
                      </a>
                    </p>
                  )}
                  {data.howWeDoIt.procedure.publishedAt && (
                    <p className="mt-1.5 text-[12px] text-client-muted">
                      Published {formatDateGB(data.howWeDoIt.procedure.publishedAt.slice(0, 10))}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-1 text-[13px] text-client-muted">No procedure recorded yet.</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 print:hidden">
        <Link
          to="/guide"
          className="inline-block rounded border border-client-accent px-3 py-1.5 text-[13px] text-client-accent hover:bg-client-accent hover:text-white"
        >
          Ask a quick question about {data.name}
        </Link>
      </section>

      <section className="mt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
          History
        </p>
        {history.length === 0 ? (
          <p className="mt-2 text-[13px] text-client-muted">Nothing closed for this area yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-client-line rounded border border-client-line bg-client-surface">
            {history.map((h, i) => (
              <li key={i} className="p-3 text-[13px]">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-client-text">{h.title}</span>
                  <span className="font-mono text-[12px] text-client-muted">
                    {formatDateGB(h.at.slice(0, 10))}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-client-muted">{h.detail}</p>
                <p className="mt-0.5 text-[11px] text-client-muted">Reviewer: {h.reviewer}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {openPolicyId && (
        <PolicyPanel policyId={openPolicyId} onClose={() => setOpenPolicyId(null)} />
      )}
    </div>
  );
}

const SECTION_LABEL: Record<string, string> = {
  policies: "Policy",
  procedures: "Procedure",
  trackers: "Tracker",
};
