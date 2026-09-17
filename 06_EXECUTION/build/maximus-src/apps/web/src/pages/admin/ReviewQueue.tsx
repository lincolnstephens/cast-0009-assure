import type { ReviewItemType } from "@maximus/shared";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

interface ReviewItem {
  id: string;
  type: ReviewItemType;
  refId: string;
  createdAt: string;
  context: Record<string, unknown>;
}

const typeLabels: Record<ReviewItemType, string> = {
  chat_amber: "Amber escalation",
  export_request: "Export request",
  alert: "Exposure alert",
  intake: "Intake",
};

const filterOptions: { value: "" | ReviewItemType; label: string }[] = [
  { value: "", label: "All types" },
  { value: "chat_amber", label: "Amber escalations" },
  { value: "export_request", label: "Export requests" },
  { value: "alert", label: "Alerts" },
  { value: "intake", label: "Intakes" },
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
        Pending items oldest first - amber escalations, export requests, alerts, and intakes.
        Every decision is audited under your name.
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
          <ReviewCard key={item.id} item={item} onDone={load} />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({ item, onDone }: { item: ReviewItem; onDone: () => Promise<void> }) {
  // Defensive: the queue is the operator's way in, so a context the API did
  // not send must degrade to a thinner card, never to a blank workspace.
  const ctx: Record<string, unknown> = (item.context ?? {}) as Record<string, unknown>;

  return (
    <div className="rounded border border-hud-line bg-hud-panel/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[11px] uppercase tracking-wider text-hud-muted">
          {typeLabels[item.type]} · raised {formatLondon(item.createdAt)}
        </p>
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
