import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { deadlineLabelSchema } from "@maximus/shared";
import type { RecordEntry, RecordResponse } from "@maximus/shared";
import { LINES } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { RecordTable } from "../../components/RecordTable";
import { useAdmin } from "../../store/admin";

const DEADLINES = deadlineLabelSchema.options;

interface ImportResult {
  imported: number;
  skipped: number;
  problems: string[];
}

/**
 * The operator's side of the Record. The MITMARK contract lead keeps this;
 * the Information Officer never sees it. Entries raised automatically by a
 * closed clock, an approved policy, an answered Guide question or a
 * completed export arrive here with a default hours figure, editable, and
 * show their source.
 */
export function AdminRecordPage() {
  const { selectedAccountId } = useAdmin();
  const [data, setData] = useState<RecordResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("all");
  const [lineFilter, setLineFilter] = useState<string>("");
  const [editing, setEditing] = useState<RecordEntry | "new" | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(
    async (p = period) => {
      if (!selectedAccountId) return;
      try {
        const qs = p && p !== "all" ? `&period=${encodeURIComponent(p)}` : "";
        const res = await api<RecordResponse>(`/admin/record?org=${selectedAccountId}${qs}`);
        setData(res);
        setError(null);
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Unable to load the record.");
      }
    },
    [selectedAccountId, period],
  );

  useEffect(() => {
    setData(null);
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedAccountId]);

  async function act(fn: () => Promise<unknown>) {
    try {
      setError(null);
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    }
  }

  async function handleImport(file: File) {
    if (!selectedAccountId) return;
    setImportResult(null);
    setImportError(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await api<ImportResult>(`/admin/record/import?org=${selectedAccountId}`, {
        method: "POST",
        body: JSON.stringify(parsed),
      });
      setImportResult(res);
      await load();
    } catch (err) {
      if (err instanceof SyntaxError) {
        setImportError("That file is not valid JSON.");
      } else {
        setImportError(err instanceof ApiError ? err.message : "Import failed.");
      }
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  const entries = (data?.entries ?? []).filter((e) => !lineFilter || e.line === Number(lineFilter));

  return (
    <div className="max-w-6xl">
      <h1 className="text-lg font-semibold">Record</h1>
      <p className="mt-0.5 text-[13px] text-hud-muted">
        Add, edit and review the entries that make up the client's Record and statement. Only
        reviewed, non-illustrative entries reach the client unless "show illustrative" is on.
      </p>

      {error && (
        <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}

      {data && (
        <>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="aPeriod" className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
                Period
              </label>
              <select
                id="aPeriod"
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  void load(e.target.value);
                }}
                className="min-w-[160px] rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
              >
                <option value="all">All periods</option>
                {data.periods.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="aLine" className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
                Service line
              </label>
              <select
                id="aLine"
                value={lineFilter}
                onChange={(e) => setLineFilter(e.target.value)}
                className="min-w-[160px] rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
              >
                <option value="">All twelve</option>
                {LINES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.id}. {l.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
            >
              Add an entry
            </button>
          </div>

          <div className="mt-4">
            <RecordTable
              entries={entries}
              ioRate={data.settings.ioRate}
              dayRate={data.settings.dayRate}
              showSource
              renderActions={(entry) => (
                <div className="flex flex-wrap gap-2 text-[12px]">
                  <button className="text-hud-accent hover:underline" onClick={() => setEditing(entry)}>
                    Edit
                  </button>
                  <button
                    className="text-hud-muted hover:underline"
                    onClick={() =>
                      void act(async () => {
                        await api(`/admin/record/${entry.id}?org=${selectedAccountId}`, {
                          method: "PATCH",
                          body: JSON.stringify({ ill: !entry.ill }),
                        });
                      })
                    }
                  >
                    {entry.ill ? "Unmark illustrative" : "Mark illustrative"}
                  </button>
                  <button
                    className="text-hud-muted hover:underline"
                    onClick={() =>
                      void act(async () => {
                        await api(`/admin/record/${entry.id}?org=${selectedAccountId}`, {
                          method: "PATCH",
                          body: JSON.stringify({ reviewed: !entry.reviewed }),
                        });
                      })
                    }
                  >
                    {entry.reviewed ? "Mark unreviewed" : "Mark reviewed"}
                  </button>
                  <button
                    className="text-status-red hover:underline"
                    onClick={() =>
                      void act(async () => {
                        if (!window.confirm("Delete this entry?")) return;
                        await api(`/admin/record/${entry.id}?org=${selectedAccountId}`, { method: "DELETE" });
                      })
                    }
                  >
                    Delete
                  </button>
                </div>
              )}
            />
          </div>

          <div className="mt-6 rounded border border-hud-line bg-hud-panel/60 p-4">
            <h2 className="text-sm font-semibold">Import a v0.1 record export</h2>
            <p className="mt-1 text-[13px] text-hud-muted">
              Reads a Tessera Assure v0.1 export file (JSON) and imports its entries, settings and
              line statuses into this organisation.
            </p>
            <input
              ref={fileInput}
              type="file"
              accept="application/json"
              className="mt-2 text-[13px]"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleImport(file);
              }}
            />
            {importError && (
              <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
                {importError}
              </p>
            )}
            {importResult && (
              <div className="mt-3 text-[13px]">
                <p>
                  Imported {importResult.imported}, skipped {importResult.skipped}.
                </p>
                {importResult.problems.length > 0 && (
                  <ul className="mt-1 list-disc pl-5 text-hud-muted">
                    {importResult.problems.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {!data && !error && <p className="mt-4 text-sm text-hud-muted">Loading…</p>}

      {editing && selectedAccountId && (
        <EntryModal
          orgId={selectedAccountId}
          entry={editing === "new" ? null : editing}
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

function EntryModal({
  orgId,
  entry,
  onClose,
  onSaved,
}: {
  orgId: string;
  entry: RecordEntry | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [date, setDate] = useState(entry?.date ?? "");
  const [line, setLine] = useState(String(entry?.line ?? 1));
  const [hours, setHours] = useState(String(entry?.hours ?? ""));
  const [reviewer, setReviewer] = useState(entry?.reviewer ?? "");
  const [what, setWhat] = useState(entry?.what ?? "");
  const [outcome, setOutcome] = useState(entry?.outcome ?? "");
  const [deadline, setDeadline] = useState(entry?.deadline ?? "");
  const [ill, setIll] = useState(entry?.ill ?? false);
  const [reviewed, setReviewed] = useState(entry?.reviewed ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const body = {
      date,
      line: Number(line),
      what,
      outcome,
      hours: Number(hours),
      deadline,
      reviewer,
      ill,
      reviewed,
    };
    try {
      if (entry) {
        await api(`/admin/record/${entry.id}?org=${orgId}`, { method: "PATCH", body: JSON.stringify(body) });
      } else {
        await api(`/admin/record?org=${orgId}`, { method: "POST", body: JSON.stringify(body) });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save the entry.");
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="grid w-full max-w-2xl grid-cols-2 gap-3 rounded border border-hud-line bg-hud-panel p-6"
      >
        <h2 className="col-span-2 text-base font-semibold">{entry ? "Edit entry" : "Add an entry"}</h2>

        <Field label="Date completed">
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Service line">
          <select
            required
            value={line}
            onChange={(e) => setLine(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            {LINES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.id}. {l.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Her hours saved">
          <input
            type="number"
            min="0"
            step="0.5"
            required
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Reviewed by">
          <input
            type="text"
            required
            placeholder="MITMARK name"
            value={reviewer}
            onChange={(e) => setReviewer(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>
        <div className="col-span-2">
          <Field label="What MITMARK did">
            <input
              type="text"
              required
              placeholder="one line, plain, past tense"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </Field>
        </div>
        <div className="col-span-2">
          <Field label="Outcome, deadline met, or risk prevented">
            <input
              type="text"
              placeholder="e.g. ICO 72-hour assessment completed in 6 hours; no notification required"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
            />
          </Field>
        </div>
        <Field label="Statutory deadline involved">
          <select
            value={deadline}
            onChange={(e) => setDeadline(e.target.value as typeof deadline)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          >
            {DEADLINES.map((d) => (
              <option key={d} value={d}>
                {d || "None"}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end gap-4 text-[13px]">
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={ill} onChange={(e) => setIll(e.target.checked)} />
            Illustrative
          </label>
          <label className="flex items-center gap-1.5">
            <input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />
            Reviewed
          </label>
        </div>

        {error && (
          <p className="col-span-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
            {error}
          </p>
        )}

        <div className="col-span-2 mt-2 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-3 py-2 text-[13px] text-hud-muted hover:text-hud-text">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-hud-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
          >
            {busy ? "Saving…" : entry ? "Save entry" : "Add entry"}
          </button>
        </div>
      </form>
    </div>
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
