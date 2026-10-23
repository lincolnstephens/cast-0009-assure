import { type FormEvent, useCallback, useEffect, useState } from "react";
import { AREAS } from "@maximus/shared";
import type { Procedure } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { formatDateGB } from "../../lib/format";
import { useAdmin } from "../../store/admin";

/**
 * How MITMARK does the work, per area. Published, a procedure is what the
 * client reads on the area page under "How we do it"; unpublished, the
 * client sees a waiting card naming the operator's target date instead,
 * never a generic document presented as theirs.
 */
export function AdminProceduresPage() {
  const { selectedAccountId } = useAdmin();
  const [procedures, setProcedures] = useState<Procedure[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!selectedAccountId) return;
    try {
      const res = await api<{ procedures: Procedure[] }>(`/admin/procedures?org=${selectedAccountId}`);
      setProcedures(res.procedures);
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load procedures.");
    }
  }, [selectedAccountId]);

  useEffect(() => {
    setProcedures(null);
    void load();
  }, [load]);

  if (!selectedAccountId) {
    return <p className="text-[13px] text-hud-muted">No client account selected.</p>;
  }

  const procedureFor = (area: number): Procedure | null =>
    procedures?.find((p) => p.area === area) ?? null;

  const pendingAreas = procedures
    ? AREAS.filter((a) => !procedureFor(a.id)?.publishedAt)
    : [];

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-semibold">Procedures</h1>
      <p className="mt-0.5 text-[13px] text-hud-muted">
        One card per area. Publish a procedure so the client can read it on the area page; until
        you do, the client sees a "Procedure to be published by MITMARK" card with your
        target date instead.
      </p>

      {error && (
        <p className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}
      {!procedures && !error && <p className="mt-4 text-[13px] text-hud-muted">Loading…</p>}

      {procedures && (
        <>
          <p className="mt-3 text-[13px] text-hud-muted">
            {pendingAreas.length === 0
              ? "Every area has a published procedure; the client sees no waiting card."
              : `The client currently sees a "to be published" card for ${pendingAreas.length} of ${AREAS.length} areas: ${pendingAreas.map((a) => a.name).join(", ")}.`}
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {AREAS.map((a) => (
              <ProcedureCard
                key={a.id}
                areaId={a.id}
                areaName={a.name}
                orgId={selectedAccountId}
                procedure={procedureFor(a.id)}
                onSaved={load}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProcedureCard({
  areaId,
  areaName,
  orgId,
  procedure,
  onSaved,
}: {
  areaId: number;
  areaName: string;
  orgId: string;
  procedure: Procedure | null;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState(procedure?.title ?? "");
  const [body, setBody] = useState(procedure?.body ?? "");
  const [link, setLink] = useState(procedure?.link ?? "");
  const [processMapLink, setProcessMapLink] = useState(procedure?.processMapLink ?? "");
  const [targetDate, setTargetDate] = useState(procedure?.targetDate ?? "");
  const [published, setPublished] = useState(procedure?.publishedAt != null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentlyPublished = procedure?.publishedAt != null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/admin/procedures/${areaId}?org=${orgId}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          body,
          link,
          processMapLink,
          targetDate: targetDate === "" ? null : targetDate,
          published,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save this procedure.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded border border-hud-line bg-hud-panel/60 p-4">
      <h2 className="text-sm font-semibold">
        {areaId}. {areaName}
      </h2>
      <p className="mt-1 text-[12px] text-hud-muted">
        {currentlyPublished
          ? `The client currently sees this procedure, published on ${formatDateGB(procedure!.publishedAt!.slice(0, 10))}.`
          : 'The client currently sees a "Procedure to be published by MITMARK" card for this area.'}
      </p>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <Field label="Title">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Body">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Procedure text, or leave blank and use the link below"
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Link">
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://…"
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Process map link">
          <input
            type="text"
            value={processMapLink}
            onChange={(e) => setProcessMapLink(e.target.value)}
            placeholder="https://…"
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>
        <Field label="Target date for publishing">
          <input
            type="date"
            value={targetDate ?? ""}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </Field>
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Published, the client can read this
        </label>
      </div>

      {error && (
        <p className="mt-2 border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
          {error}
        </p>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
        >
          {busy ? "Saving…" : "Save procedure"}
        </button>
        {saved && <span className="text-[12px] text-status-green">Saved</span>}
      </div>
    </form>
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
