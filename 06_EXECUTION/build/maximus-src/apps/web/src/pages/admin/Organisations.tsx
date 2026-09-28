import { type FormEvent, useCallback, useEffect, useState } from "react";
import { JURISDICTION_LABEL, jurisdictionSchema } from "@maximus/shared";
import { api, ApiError } from "../../lib/api";
import { useAdmin } from "../../store/admin";

interface OrgRow {
  id: string;
  name: string;
  jurisdiction: keyof typeof JURISDICTION_LABEL;
  regulationLabel: string;
  userCount: number;
  taskCount: number;
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Organisations (FRAGO 05 3.4). Creating one writes its empty record and
 * nothing else. Applying the task library is a separate step, and the
 * confirmation says how many tasks it will create before anything is written.
 */
export function AdminOrganisationsPage() {
  const { selectedAccountId, selectAccount, loadAccounts } = useAdmin();
  const [orgs, setOrgs] = useState<OrgRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState<{ org: OrgRow; startDate: string; willCreate: number } | null>(null);

  const load = useCallback(async () => {
    try {
      setOrgs((await api<{ organisations: OrgRow[] }>("/admin/organisations")).organisations);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load organisations.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setError(null);
    try {
      const res = await api<{ organisation: OrgRow }>("/admin/organisations", {
        method: "POST",
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          jurisdiction: String(form.get("jurisdiction") ?? "UK"),
          regulationLabel: String(form.get("regulationLabel") ?? ""),
        }),
      });
      formEl.reset();
      setNotice(`Created ${res.organisation.name}. It has no tasks yet.`);
      await load();
      await loadAccounts();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create the organisation.");
    }
  }

  async function preview(org: OrgRow, startDate: string) {
    setError(null);
    try {
      const res = await api<{ willCreate: number }>(
        `/admin/workplan/apply-library/preview?org=${org.id}&startDate=${startDate}`,
      );
      setPending({ org, startDate, willCreate: res.willCreate });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to count the tasks.");
    }
  }

  async function apply() {
    if (!pending) return;
    try {
      const res = await api<{ created: number }>(`/admin/workplan/apply-library?org=${pending.org.id}`, {
        method: "POST",
        body: JSON.stringify({ startDate: pending.startDate }),
      });
      setNotice(`Applied the task library to ${pending.org.name}: ${res.created} task(s) created.`);
      setPending(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to apply the library.");
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Organisations</h1>
        <p className="mt-1 text-[13px] text-hud-muted">
          Each organisation has its own workplan, documents and settings. Choose which one you are working on with the
          Organisation switcher at the top of the page.
        </p>
      </div>

      {notice && (
        <p role="status" className="border-l-2 border-status-green pl-3 text-[13px]">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="border-l-2 border-status-red pl-3 text-[13px] text-status-red">
          {error}
        </p>
      )}

      {pending && (
        <div data-testid="apply-library-confirm" className="rounded border border-hud-gold/60 bg-hud-panel p-4 text-[13px]">
          <p>
            Applying the task library to <strong>{pending.org.name}</strong> from {pending.startDate} will create{" "}
            <strong data-testid="apply-library-count">{pending.willCreate}</strong> task(s). Tasks already present are
            left as they are.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              data-testid="apply-library-go"
              onClick={() => void apply()}
              className="rounded bg-hud-accent px-3 py-1.5 font-medium text-white hover:bg-hud-accent/90"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="rounded border border-hud-line px-3 py-1.5 hover:border-hud-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => void create(e)}
        data-testid="create-organisation-form"
        className="grid grid-cols-1 gap-3 rounded border border-hud-line bg-hud-panel/60 p-4 sm:grid-cols-4 sm:items-end"
      >
        <label className="text-[13px] sm:col-span-2">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
            Display name, as it should appear on the client's pages
          </span>
          <input name="name" required className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5" />
        </label>
        <label className="text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">Jurisdiction</span>
          <select name="jurisdiction" defaultValue="UK" className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5">
            {jurisdictionSchema.options.map((j) => (
              <option key={j} value={j}>
                {JURISDICTION_LABEL[j]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">Regulation label, optional</span>
          <input name="regulationLabel" className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5" />
        </label>
        <p className="text-[12px] text-hud-muted sm:col-span-4">Only the United Kingdom has task and obligation content in this version.</p>
        <div className="sm:col-span-4">
          <button
            type="submit"
            className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90"
          >
            Create organisation
          </button>
        </div>
      </form>

      {/* The table appears once its rows have arrived, never empty while loading. */}
      {orgs !== null && (
      <div className="overflow-x-auto">
        <table data-testid="organisations-table" className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-wider text-hud-muted">
            <tr>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Jurisdiction</th>
              <th className="py-2 pr-3">Users</th>
              <th className="py-2 pr-3">Tasks</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hud-line">
            {orgs.map((o) => (
              <tr key={o.id} data-testid="organisation-row" data-org-id={o.id}>
                <td className="py-2 pr-3">
                  {o.name}
                  {o.id === selectedAccountId && <span className="ml-2 text-[11px] text-hud-gold">(selected)</span>}
                  <span data-testid="organisation-id" className="block select-all font-mono text-[11px] text-hud-muted">
                    {o.id}
                  </span>
                </td>
                <td className="py-2 pr-3">{JURISDICTION_LABEL[o.jurisdiction] ?? o.jurisdiction}</td>
                <td className="py-2 pr-3">{o.userCount}</td>
                <td className="py-2 pr-3">{o.taskCount}</td>
                <td className="flex flex-wrap gap-2 py-2">
                  {o.id !== selectedAccountId && (
                    <button
                      type="button"
                      onClick={() => selectAccount(o.id)}
                      className="rounded border border-hud-line px-2 py-0.5 text-[12px] hover:border-hud-accent"
                    >
                      Work on this one
                    </button>
                  )}
                  <button
                    type="button"
                    data-testid="apply-library"
                    onClick={() => void preview(o, today())}
                    className="rounded border border-hud-line px-2 py-0.5 text-[12px] hover:border-hud-accent"
                  >
                    Apply task library
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {orgs === null && !error && <p className="text-[13px] text-hud-muted">Loading…</p>}
    </div>
  );
}
