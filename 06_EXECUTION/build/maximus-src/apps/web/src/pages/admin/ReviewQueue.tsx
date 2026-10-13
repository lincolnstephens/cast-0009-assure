import { DOCUMENT_SECTIONS, areaName, type ReviewItemType } from "@maximus/shared";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

interface ReviewItem {
  id: string;
  type: ReviewItemType;
  refId: string;
  createdAt: string;
  summary?: string;
  context: Record<string, unknown>;
  /** v1.7. Working days the item has waited, and the amber flag at five. */
  workingDaysWaiting?: number;
  overdue?: boolean;
  /** v1.7. Raised by a test seat. */
  test?: boolean;
}

const typeLabels: Record<ReviewItemType, string> = {
  chat_amber: "Amber escalation",
  export_request: "Export request",
  alert: "Exposure alert",
  intake: "Intake",
  task_confirmation: "Client confirmation",
  document_submission: "Client document",
};

const filterOptions: { value: "" | ReviewItemType; label: string }[] = [
  { value: "", label: "All types" },
  { value: "chat_amber", label: "Amber escalations" },
  { value: "export_request", label: "Export requests" },
  { value: "alert", label: "Alerts" },
  { value: "intake", label: "Intakes" },
  { value: "task_confirmation", label: "Client confirmations" },
  { value: "document_submission", label: "Client documents" },
];

export function AdminReviewQueuePage() {
  const { selectedAccountId } = useAdmin();
  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [typeFilter, setTypeFilter] = useState<"" | ReviewItemType>("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const qs = typeFilter ? `&type=${typeFilter}` : "";
      const res = await api<{ items: ReviewItem[] }>(
        `/admin/review?accountId=${selectedAccountId}${qs}`,
      );
      setItems(res.items);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load review queue.");
    }
  }, [selectedAccountId, typeFilter]);

  useEffect(() => {
    setItems(null);
    void load();
    const timer = setInterval(() => void load(), 12_000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-semibold">Review queue</h1>
      <p className="mt-0.5 text-[13px] text-hud-muted">
        Pending items oldest first - amber escalations, export requests, alerts, intakes, client
        confirmations and documents the client has sent. An item waiting five working days or more
        is flagged amber. Every decision is audited under your name.
      </p>
      <div className="mt-1.5 h-px w-12 bg-hud-gold/60" />

      <div className="mt-4 flex items-center gap-2">
        <label className="text-[13px] text-hud-muted" htmlFor="type-filter">
          Filter
        </label>
        <select
          id="type-filter"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "" | ReviewItemType)}
          className="rounded border border-hud-line bg-hud-bg px-2 py-1 text-[13px] outline-none focus:border-hud-accent"
        >
          {filterOptions.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="mt-4 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      {!items && !error && <p className="mt-4 text-[13px] text-hud-muted">Loading…</p>}

      {items && items.length === 0 && (
        <p className="mt-4 text-[13px] text-hud-muted">Nothing waiting. All caught up.</p>
      )}

      <div className="mt-4 space-y-3">
        {items?.map((item) => (
          <ReviewCard key={item.id} item={item} orgId={selectedAccountId ?? ""} onDone={load} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  item,
  orgId,
  onDone,
}: {
  item: ReviewItem;
  orgId: string;
  onDone: () => Promise<void>;
}) {
  // Defensive: the queue is the operator's way in, so a context the API did
  // not send must degrade to a thinner card, never to a blank workspace.
  const ctx: Record<string, unknown> = (item.context ?? {}) as Record<string, unknown>;

  return (
    <div
      data-testid="review-item"
      data-type={item.type}
      data-overdue={String(Boolean(item.overdue))}
      className={`rounded border bg-hud-panel/60 p-4 ${item.overdue ? "border-status-amber/70" : "border-hud-line"}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-hud-muted">
          {typeLabels[item.type] ?? item.type} · raised {formatLondon(item.createdAt)}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {item.test && (
            <span
              data-testid="test-label"
              className="rounded border border-status-amber/60 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-status-amber"
            >
              Test seat
            </span>
          )}
          {item.overdue && (
            <span
              data-testid="review-overdue-flag"
              className="rounded border border-status-amber/60 px-1.5 py-0.5 text-[11px] text-status-amber"
            >
              Waiting {item.workingDaysWaiting ?? 5} working days
            </span>
          )}
        </div>
      </div>

      {item.type === "chat_amber" && (
        <>
          <p className="mt-2 text-sm font-medium">“{String(ctx.question ?? "")}”</p>
          <p className="mt-1.5 text-[13px] text-hud-muted">
            Guide said: {String(ctx.guideReply ?? "")}
          </p>
          <AnswerForm itemId={item.id} onDone={onDone} />
        </>
      )}

      {item.type === "export_request" && (
        <>
          <p className="mt-2 text-[13px]">
            Client requested a defence-file export ({String(ctx.exportState ?? "requested")}).
          </p>
          <ApproveRejectActions itemId={item.id} onDone={onDone} />
        </>
      )}

      {item.type === "alert" && (
        <>
          <p className="mt-2 text-sm font-medium">{String(ctx.summary ?? "")}</p>
          <p className="mt-1 text-[13px] text-hud-muted">
            {String(ctx.kind ?? "")} · {String(ctx.severity ?? "")}
            {ctx.isDemo ? " · DEMO DATA" : ""}
          </p>
          <ApproveRejectActions itemId={item.id} onDone={onDone} />
        </>
      )}

      {item.type === "task_confirmation" && (
        <>
          <p className="mt-2 text-[13px]">{String(ctx.summary ?? item.summary ?? "")}</p>
          {item.test && (
            <p className="mt-1 text-[12px] text-hud-muted">Test seat: accepting changes nothing in the workplan.</p>
          )}
          <ApproveRejectActions itemId={item.id} onDone={onDone} />
        </>
      )}

      {item.type === "document_submission" && <DocumentSubmission item={item} orgId={orgId} onDone={onDone} />}

      {item.type === "intake" && (
        <>
          <p className="mt-2 text-sm font-medium">
            {String(ctx.intakeType ?? "")} from {String(ctx.source ?? "")}
          </p>
          <p className="mt-1 text-[13px] text-hud-muted">{String(ctx.summary ?? "")}</p>
          <ApproveRejectActions itemId={item.id} onDone={onDone} />
        </>
      )}
    </div>
  );
}

function AnswerForm({ itemId, onDone }: { itemId: string; onDone: () => Promise<void> }) {
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/review/${itemId}/answer`, {
        method: "POST",
        body: JSON.stringify({ reply }),
      });
      await onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to send the answer.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3">
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        required
        rows={3}
        placeholder="Your answer - posts into the client's chat thread."
        className="w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-[13px] outline-none placeholder:text-hud-muted/70 focus:border-hud-accent"
      />
      {error && (
        <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          disabled={busy || reply.trim().length === 0}
          className="rounded bg-hud-accent px-4 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-50"
        >
          {busy ? "Sending…" : "Answer as officer"}
        </button>
      </div>
    </form>
  );
}

function ApproveRejectActions({
  itemId,
  onDone,
}: {
  itemId: string;
  onDone: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "approve" | "reject") {
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/review/${itemId}/${action}`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      await onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
      setBusy(false);
    }
  }

  return (
    <div className="mt-3">
      {error && (
        <p className="mb-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("reject")}
          className="rounded border border-hud-line px-3 py-1.5 text-[13px] text-hud-muted hover:bg-hud-bg disabled:opacity-50"
        >
          Reject
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void act("approve")}
          className="rounded bg-hud-accent px-4 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-50"
        >
          {busy ? "Working…" : "Approve"}
        </button>
      </div>
    </div>
  );
}

const SECTION_IDS = ["policies", "procedures", "trackers"] as const;
type SectionId = (typeof SECTION_IDS)[number];

/**
 * v1.7 (FRAGO 07 3.1). A document the client sent. Accept chooses its section
 * and publishes it; Return sends a one-line reason the client sees. Nothing is
 * published or counted before Accept.
 */
function DocumentSubmission({
  item,
  orgId,
  onDone,
}: {
  item: ReviewItem;
  orgId: string;
  onDone: () => Promise<void>;
}) {
  const ctx = (item.context ?? {}) as Record<string, unknown>;
  const earlierSection = SECTION_IDS.find((x) => x === ctx.supersedesSection);
  const [section, setSection] = useState<SectionId>(earlierSection ?? "procedures");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const area = typeof ctx.area === "number" ? ctx.area : null;
  const sizeBytes = typeof ctx.sizeBytes === "number" ? ctx.sizeBytes : 0;
  const isLink = ctx.kind === "link";
  const documentId = typeof ctx.documentId === "string" ? ctx.documentId : null;

  async function act(path: "accept-document" | "return-document", body: unknown) {
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/review/${item.id}/${path}`, { method: "POST", body: JSON.stringify(body) });
      await onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action failed.");
      setBusy(false);
    }
  }

  return (
    <>
      <p className="mt-2 text-sm font-medium">{String(ctx.title ?? "")}</p>
      <p className="mt-1 text-[13px] text-hud-muted">
        {area ? `Module ${area}, ${areaName(area)}` : "No module given"}
        {ctx.submittedBy ? ` · sent by ${String(ctx.submittedBy)}` : ""}
      </p>
      {ctx.note ? <p className="mt-1 text-[13px]">{String(ctx.note)}</p> : null}
      <p className="mt-1 text-[13px] text-hud-muted">
        {isLink
          ? `Link: ${String(ctx.url ?? "")}`
          : `${String(ctx.fileName ?? "File")} (${(sizeBytes / 1024).toFixed(0)} KB)`}
        {ctx.searchable === "no" ? " · not searchable" : ""}
      </p>
      {ctx.supersedesTitle ? (
        <p className="mt-1 text-[13px] text-hud-muted">New version of {String(ctx.supersedesTitle)}</p>
      ) : null}
      {documentId && (
        <a
          href={`/api/admin/documents/${documentId}/download?org=${encodeURIComponent(orgId)}`}
          target="_blank"
          rel="noopener"
          className="mt-1 inline-block text-[13px] text-hud-accent hover:underline"
        >
          {isLink ? "Open" : "Download"}
        </a>
      )}
      {item.test && (
        <p className="mt-1 text-[12px] text-hud-muted">Test seat: accepted or not, no client ever sees it.</p>
      )}

      {error && (
        <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-end justify-end gap-2">
        <label className="text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">Section</span>
          <select
            data-testid="accept-section"
            value={section}
            onChange={(e) => setSection(e.target.value as SectionId)}
            className="rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            {SECTION_IDS.map((id) => (
              <option key={id} value={id}>
                {DOCUMENT_SECTIONS.find((d) => d.id === id)?.name ?? id}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          data-testid="accept-document"
          disabled={busy}
          onClick={() => void act("accept-document", { section })}
          className="rounded bg-hud-accent px-4 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-50"
        >
          {busy ? "Working…" : "Accept and publish"}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
        <input
          data-testid="return-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={300}
          placeholder="One-line reason the client will see"
          className="min-w-[260px] flex-1 rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px] outline-none placeholder:text-hud-muted/70 focus:border-hud-accent"
        />
        <button
          type="button"
          data-testid="return-document"
          disabled={busy || reason.trim().length === 0}
          onClick={() => void act("return-document", { reason: reason.trim() })}
          className="rounded border border-hud-line px-3 py-1.5 text-[13px] text-hud-muted hover:bg-hud-bg disabled:opacity-50"
        >
          Return
        </button>
      </div>
    </>
  );
}
