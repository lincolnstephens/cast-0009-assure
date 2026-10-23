import { type FormEvent, useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../../lib/api";
import { formatLondon } from "../../lib/format";
import { useAdmin } from "../../store/admin";

interface UserRow {
  id: string;
  email: string;
  displayName: string;
  role: "client" | "mitmark_admin";
  orgId: string | null;
  orgName: string | null;
  status: "active" | "disabled" | "must_change_password";
  lastSignInAt: string | null;
  /** v1.7. A client test seat; the flag is never removed. */
  testSeat?: boolean;
}

const STATUS_LABEL: Record<UserRow["status"], string> = {
  active: "Active",
  disabled: "Disabled",
  must_change_password: "Must change password",
};

/**
 * Users (FRAGO 05 3.2). The product never sends email. A new or reset
 * password is shown here once, to the manager who asked, and is gone when
 * the page changes; the manager passes it on by whatever channel MITMARK
 * uses, and the user must replace it at first sign-in.
 */
export function AdminUsersPage() {
  const { accounts } = useAdmin();
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState<{ email: string; password: string } | null>(null);
  const [role, setRole] = useState<"client" | "mitmark_admin">("client");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setUsers((await api<{ users: UserRow[] }>("/admin/users")).users);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to load users.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function create(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ user: UserRow; oneTimePassword: string }>("/admin/users", {
        method: "POST",
        body: JSON.stringify({
          email: String(form.get("email") ?? ""),
          role,
          orgId: role === "client" ? String(form.get("orgId") ?? "") || null : null,
          displayName: String(form.get("displayName") ?? "") || undefined,
          testSeat: role === "client" && form.get("testSeat") === "on",
        }),
      });
      setShown({ email: res.user.email, password: res.oneTimePassword });
      formEl.reset();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create the user.");
    } finally {
      setBusy(false);
    }
  }

  async function act(u: UserRow, action: "reset-password" | "disable" | "enable") {
    setError(null);
    try {
      const res = await api<{ oneTimePassword?: string }>(`/admin/users/${u.id}/${action}`, { method: "POST" });
      if (res.oneTimePassword) setShown({ email: u.email, password: res.oneTimePassword });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That did not go through.");
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Users</h1>
        <p className="mt-1 text-[13px] text-hud-muted">
          A manager sees every organisation. A client user belongs to one. Tessera Assure does not send email: a new or
          reset password is shown here once, and you pass it on yourself. The user must choose their own at first
          sign-in.
        </p>
      </div>

      {shown && (
        <div
          data-testid="one-time-password"
          role="status"
          className="rounded border border-hud-gold/60 bg-hud-panel p-4 text-[13px]"
        >
          <p className="font-semibold">One-time password for {shown.email}</p>
          <p className="mt-2 select-all font-mono text-base tracking-wider">{shown.password}</p>
          <p className="mt-2 text-hud-muted">
            Shown once. It is not stored and cannot be shown again; if it is lost, reset the password. Tessera Assure does
            not send email, so pass it on by MITMARK's usual secure channel.
          </p>
          <button
            type="button"
            onClick={() => setShown(null)}
            className="mt-3 rounded border border-hud-line px-3 py-1 text-[12px] hover:border-hud-accent"
          >
            I have passed it on
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="border-l-2 border-status-red pl-3 text-[13px] text-status-red">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => void create(e)}
        data-testid="create-user-form"
        className="grid grid-cols-1 gap-3 rounded border border-hud-line bg-hud-panel/60 p-4 sm:grid-cols-5 sm:items-end"
      >
        <label className="text-[13px] sm:col-span-2">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">Email address</span>
          <input name="email" type="email" required className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5" />
        </label>
        <label className="text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">Role</span>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5"
          >
            <option value="client">Client user</option>
            <option value="mitmark_admin">Manager</option>
          </select>
        </label>
        <label className="text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">Organisation</span>
          <select
            name="orgId"
            disabled={role !== "client"}
            required={role === "client"}
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 disabled:opacity-50"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">Display name, optional</span>
          <input name="displayName" className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5" />
        </label>
        <label className="flex items-start gap-2 text-[13px] sm:col-span-5">
          <input
            type="checkbox"
            name="testSeat"
            data-testid="user-test-seat"
            disabled={role !== "client"}
            className="mt-0.5 disabled:opacity-50"
          />
          <span className={role !== "client" ? "opacity-50" : ""}>
            Test seat (for trying the client's side; its writes are tagged test and kept out of the
            Record, the counters and the Statement)
          </span>
        </label>
        <div className="sm:col-span-5">
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-hud-accent px-3 py-1.5 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
          >
            Create user and show the one-time password
          </button>
        </div>
      </form>

      {/* The table appears once its rows have arrived, never empty while loading. */}
      {users !== null && (
      <div className="overflow-x-auto">
        <table data-testid="users-table" className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="text-[11px] uppercase tracking-wider text-hud-muted">
            <tr>
              <th className="py-2 pr-3">Email</th>
              <th className="py-2 pr-3">Role</th>
              <th className="py-2 pr-3">Organisation</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Last sign-in</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hud-line">
            {users.map((u) => (
              <tr key={u.id} data-testid="user-row" data-user-id={u.id}>
                <td className="py-2 pr-3">{u.email}</td>
                <td className="py-2 pr-3">
                  {u.role === "mitmark_admin" ? "Manager" : "Client user"}
                  {u.testSeat && (
                    <span
                      data-testid="test-seat-label"
                      className="ml-2 rounded border border-status-amber px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-status-amber"
                    >
                      Test seat
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3">{u.role === "mitmark_admin" ? "All" : (u.orgName ?? u.orgId)}</td>
                <td className="py-2 pr-3">{STATUS_LABEL[u.status]}</td>
                <td className="py-2 pr-3">{u.lastSignInAt ? formatLondon(u.lastSignInAt) : "Never"}</td>
                <td className="flex flex-wrap gap-2 py-2">
                  <button
                    type="button"
                    data-testid="reset-password"
                    onClick={() => void act(u, "reset-password")}
                    className="rounded border border-hud-line px-2 py-0.5 text-[12px] hover:border-hud-accent"
                  >
                    Reset password
                  </button>
                  {u.status === "disabled" ? (
                    <button
                      type="button"
                      data-testid="enable-user"
                      onClick={() => void act(u, "enable")}
                      className="rounded border border-hud-line px-2 py-0.5 text-[12px] hover:border-hud-accent"
                    >
                      Re-enable
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-testid="disable-user"
                      onClick={() => void act(u, "disable")}
                      className="rounded border border-hud-line px-2 py-0.5 text-[12px] hover:border-status-red"
                    >
                      Disable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      {users === null && !error && <p className="text-[13px] text-hud-muted">Loading…</p>}
    </div>
  );
}
