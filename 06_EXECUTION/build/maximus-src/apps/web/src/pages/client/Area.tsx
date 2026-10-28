import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { REGISTRATIONS_HEADING, type AreaPage, type CounterGroup, type Milestone, type ModuleTile } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { apiHref } from "../../lib/preview";
import { formatDateGB } from "../../lib/format";
import { PolicyPanel } from "../../components/PolicyPanel";
import { RegistrationsTable } from "../../components/tracker/Coverage";
import { ModuleNav } from "../../components/tracker/ModuleNav";
import { RagMark } from "../../components/tracker/RagMark";
import { TaskTable } from "../../components/tracker/TaskTable";

/**
 * One module's page, laid out as the operator's deck (FRAGO 06 section 3.1),
 * the same seven sections on all eight, top to bottom: the name and its one
 * line; Useful links as tiles, then the same items as a numbered list; the
 * compliance status under the 3.6 score rule; the compliance journey drawn
 * from the module's dated tasks; the counters (modules 5 to 8); the jobs in
 * the six-question table; then what the law asks, how we do it and history.
 * The module navigation closes the page. Nothing is drawn that is not stored.
 * Prints as a clean document via the house `@media print` rules in index.css.
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

      <UsefulLinks tiles={data.tiles} onOpenPolicy={setOpenPolicyId} />

      {/* v1.10 (FRAGO 11 3.3): module 1, from the organisation's jurisdictions. */}
      <RegistrationsTable entries={data.registrations ?? []} heading={REGISTRATIONS_HEADING} />

      <section
        data-testid="module-progress-card"
        aria-labelledby="module-status-heading"
        className="mt-6 rounded border border-client-line bg-client-surface p-4"
        title={data.score.basis}
      >
        <h2 id="module-status-heading" className="text-[14px] font-semibold">
          Compliance status
        </h2>
        <p
          data-testid="module-progress"
          data-rag={data.score.rag}
          className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] font-semibold text-client-text"
        >
          <span data-testid="module-score">{data.score.sentence}</span>{" "}
          <RagMark rag={data.score.rag} label={data.score.label} />
        </p>
        <p data-testid="module-score-basis" className="mt-1.5 max-w-[75ch] text-[12px] text-client-muted">
          {data.score.basis}
        </p>
        <p className="mt-0.5 text-[12px] text-client-muted">As at {formatDateGB(data.status.asAt)}</p>
      </section>

      <ModuleJourney milestones={data.milestones} />

      {data.counters.length > 0 && <Counters groups={data.counters} />}

      <section className="mt-6" data-testid="module-jobs" aria-labelledby="module-jobs-heading">
        <h2 id="module-jobs-heading" className="text-[14px] font-semibold">
          Jobs
        </h2>
        <div className="mt-2">
          <TaskTable tasks={data.tasks} />
        </div>
      </section>

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

      <section className="mt-8" data-testid="module-history">
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

      <div className="mt-10 print:hidden">
        <ModuleNav />
      </div>

      {openPolicyId && (
        <PolicyPanel policyId={openPolicyId} onClose={() => setOpenPolicyId(null)} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Useful links (FRAGO 06 3.1 item 2)
// ---------------------------------------------------------------------------

const KIND_LABEL: Record<ModuleTile["kind"], string> = {
  register: "Register",
  policy: "Policy",
  file: "Document",
  link: "Link",
  retention: "Retention period",
};

/**
 * The tiles, then the same items as a numbered list for phones and screen
 * readers. Every tile opens something: a file or link downloads or redirects,
 * a policy opens in the policy panel, and a register not yet filed or a
 * retention category opens its own card beneath the tiles.
 */
function UsefulLinks({
  tiles,
  onOpenPolicy,
}: {
  tiles: ModuleTile[];
  onOpenPolicy: (id: string) => void;
}) {
  const [card, setCard] = useState<ModuleTile | null>(null);

  const open = (t: ModuleTile) => {
    if (t.opens === "policy" && t.ref) onOpenPolicy(t.ref);
    else if (t.opens === "card") setCard(card?.id === t.id ? null : t);
  };

  const tileBody = (t: ModuleTile) => (
    <>
      <span className="block font-mono text-[10px] uppercase tracking-wider text-client-muted">
        {KIND_LABEL[t.kind]}
      </span>
      <span className="mt-1 block text-[13px] font-semibold leading-snug text-client-text">{t.title}</span>
      {t.detail && (
        <span
          data-testid="module-tile-detail"
          className={`mt-1 block text-[12px] ${t.filed ? "text-client-muted" : "text-status-amber"}`}
        >
          {t.detail}
        </span>
      )}
    </>
  );

  const tileClass =
    "block h-full w-full rounded border border-client-line bg-client-surface p-3 text-left hover:border-client-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-client-accent";

  return (
    <section data-testid="module-links" className="mt-5" aria-labelledby="module-links-heading">
      <h2 id="module-links-heading" className="text-[14px] font-semibold">
        Useful links
      </h2>
      {tiles.length === 0 ? (
        <p data-testid="module-documents-empty" className="mt-1.5 text-[13px] text-client-muted">
          None filed yet
        </p>
      ) : (
        <>
          <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
            {tiles.map((t) => (
              <li key={t.id} className="min-w-0">
                {t.opens === "download" && t.ref ? (
                  <a
                    data-testid="module-link-tile"
                    data-kind={t.kind}
                    data-opens={t.opens}
                    href={apiHref(`/tracker/documents/${t.ref}/download`)}
                    target="_blank"
                    rel="noreferrer"
                    className={tileClass}
                  >
                    {tileBody(t)}
                  </a>
                ) : (
                  <button
                    type="button"
                    data-testid="module-link-tile"
                    data-kind={t.kind}
                    data-opens={t.opens}
                    aria-expanded={t.opens === "card" ? card?.id === t.id : undefined}
                    onClick={() => open(t)}
                    className={tileClass}
                  >
                    {tileBody(t)}
                  </button>
                )}
              </li>
            ))}
          </ul>

          {card && (
            <div
              data-testid="module-tile-card"
              role="region"
              aria-label={card.title}
              className="mt-2 rounded border border-dashed border-client-line bg-client-surface p-4"
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-client-muted">
                {KIND_LABEL[card.kind]}
              </p>
              <p className="mt-1 text-[14px] font-semibold text-client-text">{card.title}</p>
              <p data-testid="module-tile-card-detail" className="mt-1 text-[13px] text-client-text">
                {card.detail}
              </p>
              {card.description && <p className="mt-1 text-[12px] text-client-muted">{card.description}</p>}
              <button
                type="button"
                onClick={() => setCard(null)}
                className="mt-2 text-[12px] text-client-accent underline print:hidden"
              >
                Close
              </button>
            </div>
          )}

          <ol data-testid="module-links-list" className="mt-3 list-decimal space-y-1 pl-5 text-[13px]">
            {tiles.map((t) => (
              <li key={t.id} data-testid="module-doc-item">
                {t.opens === "download" && t.ref ? (
                  <a
                    data-testid="module-doc"
                    href={apiHref(`/tracker/documents/${t.ref}/download`)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-client-accent underline"
                  >
                    {t.title}
                  </a>
                ) : (
                  <button
                    type="button"
                    data-testid="module-doc"
                    onClick={() => open(t)}
                    className="text-left text-client-accent underline"
                  >
                    {t.title}
                  </button>
                )}{" "}
                <span className="ml-1 text-[12px] text-client-muted">
                  {KIND_LABEL[t.kind]}
                  {t.detail ? `, ${t.detail}` : ""}
                </span>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Compliance journey (FRAGO 06 3.1 item 4)
// ---------------------------------------------------------------------------

const MILESTONE_FILL: Record<Milestone["state"], string> = {
  done: "bg-status-green border-status-green",
  overdue: "bg-status-amber border-status-amber",
  next: "bg-client-muted border-client-muted",
  future: "bg-client-surface border-client-muted",
};

const MILESTONE_LABEL: Record<Milestone["state"], string> = {
  done: "Done",
  overdue: "Next, overdue",
  next: "Next",
  future: "Planned",
};

const monthYear = (iso: string) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString("en-GB", { month: "short", year: "numeric" });

/**
 * The module's dated tasks as a line of milestones, oldest left, at most six.
 * Done is green; the next open one is amber when it is overdue and grey
 * otherwise; later ones are hollow. Each carries its state in words.
 */
function ModuleJourney({ milestones }: { milestones: Milestone[] }) {
  return (
    <section data-testid="module-journey" className="mt-6" aria-labelledby="module-journey-heading">
      <h2 id="module-journey-heading" className="text-[14px] font-semibold">
        Compliance journey
      </h2>
      {milestones.length === 0 ? (
        <p data-testid="module-journey-empty" className="mt-1.5 text-[13px] text-client-muted">
          No dated milestones yet.
        </p>
      ) : (
        <ol className="relative mt-4 grid grid-cols-1 gap-3 sm:grid-flow-col sm:auto-cols-fr sm:gap-2">
          <span
            aria-hidden
            className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-client-line sm:left-[8%] sm:right-[8%] sm:top-[9px] sm:bottom-auto sm:h-0.5 sm:w-auto"
          />
          {milestones.map((m) => (
            <li
              key={m.taskId}
              data-testid="module-milestone"
              data-state={m.state}
              data-task-id={m.taskId}
              className="relative flex items-start gap-3 sm:flex-col sm:items-center sm:gap-1.5 sm:text-center"
            >
              <span aria-hidden className={`h-5 w-5 shrink-0 rounded-full border-2 ${MILESTONE_FILL[m.state]}`} />
              <span className="min-w-0">
                <span
                  data-testid="module-milestone-title"
                  className="block text-[12px] font-medium leading-snug text-client-text"
                >
                  {m.title}
                </span>{" "}
                <span className="block font-mono text-[11px] text-client-muted">{monthYear(m.dueAt)}</span>{" "}
                <span className="block font-mono text-[10px] uppercase tracking-wider text-client-muted">
                  {MILESTONE_LABEL[m.state]}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Counters (FRAGO 06 3.3), modules 5 to 8
// ---------------------------------------------------------------------------

function Counters({ groups }: { groups: CounterGroup[] }) {
  return (
    <section data-testid="module-counters" className="mt-6" aria-labelledby="module-counters-heading">
      <h2 id="module-counters-heading" className="text-[14px] font-semibold">
        Counts
      </h2>
      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {groups.map((g) => (
          <div
            key={g.key}
            data-testid="counter-group"
            data-source={g.source}
            data-nodata={g.noData ? "true" : "false"}
            className="rounded border border-client-line bg-client-surface p-4"
          >
            <p className="text-[13px] font-semibold text-client-text">{g.label}</p>
            {g.noData ? (
              <p data-testid="counter-nodata" className="mt-1.5 text-[13px] text-client-muted">
                No data yet
              </p>
            ) : (
              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[13px]">
                {g.items.map((i) => (
                  <div key={i.key} data-testid="counter-item" className="contents">
                    <dt className="text-client-muted">{i.label}</dt>
                    <dd className="text-right font-mono tabular-nums text-client-text">
                      {i.value === null ? "No data yet" : i.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
            <p data-testid="counter-basis" className="mt-2 text-[11px] text-client-muted">
              {g.basis}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
