import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { MitmarkLogo } from "../components/MitmarkLogo";
import { endPreview } from "../lib/preview";
import { useAdmin } from "../store/admin";
import { useAuth } from "../store/auth";

// `view` is the identifier the gate drives the product by. The label is what
// the operator reads; the two are deliberately not the same string.
const navItems = [
  { to: "/admin", label: "Review queue", view: "queue", end: true },
  { to: "/admin/workplan", label: "Workplan", view: "workplan" },
  { to: "/admin/documents", label: "Documents", view: "documents-admin" },
  { to: "/admin/figures", label: "Figures", view: "figures-admin" },
  { to: "/admin/jobs", label: "Jobs", view: "jobs-admin" },
  { to: "/admin/value", label: "Value", view: "value-admin" },
  { to: "/admin/record", label: "Record", view: "record" },
  { to: "/admin/clocks", label: "Intakes and clocks", view: "clocks" },
  { to: "/admin/procedures", label: "Procedures", view: "procedures" },
  { to: "/admin/policies", label: "Policy pack", view: "policies-admin" },
  { to: "/admin/posture", label: "Posture control", view: "posture-admin" },
  { to: "/admin/alerts", label: "Alert triage", view: "alerts" },
  { to: "/admin/exports", label: "Exports", view: "exports" },
  { to: "/admin/settings", label: "Settings", view: "settings" },
  { to: "/admin/audit", label: "Audit log", view: "audit" },
  { to: "/admin/organisations", label: "Organisations", view: "organisations" },
  { to: "/admin/users", label: "Users", view: "users" },
  { to: "/admin/client-view", label: "View as client", view: "client-view" },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const {
    accounts,
    selectedAccountId,
    accountsStatus,
    accountsError,
    loadAccounts,
    selectAccount,
  } = useAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  // Arriving in the admin workspace by any route ends "View as client", so
  // the preview header never rides along on the operator's own work.
  useEffect(() => {
    endPreview();
  }, []);

  return (
    <div className="admin-workspace flex h-full flex-col sm:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-hud-line bg-hud-panel/60 sm:w-44 sm:border-b-0 sm:border-r md:w-52">
        <div className="border-b border-hud-gold/40 px-4 py-3">
          <MitmarkLogo className="mb-2 h-5 w-auto opacity-80" />
          <div className="text-sm font-semibold tracking-[0.25em]">TESSERA ASSURE</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-hud-gold">
            ADMIN WORKSPACE
          </div>
        </div>
        <nav className="flex-1 py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-view={item.view}
              className={({ isActive }) =>
                `block border-l-2 px-4 py-1.5 text-[13px] transition-colors ${
                  isActive
                    ? "border-hud-gold bg-hud-panel text-hud-text"
                    : "border-transparent text-hud-muted hover:text-hud-text"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => {
            void logout().then(() => navigate("/login"));
          }}
          className="border-t border-hud-line px-4 py-2.5 text-left text-[13px] text-hud-muted hover:text-hud-text"
        >
          Sign out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-hud-line bg-hud-panel/40 px-4 py-2.5 sm:px-5">
          {/* The organisation switcher (FRAGO 05 3.4). Every admin page, and
              View as client, acts on the organisation chosen here. */}
          <label className="flex min-w-0 items-center gap-2 text-[13px] text-hud-muted">
            Organisation
            <select
              data-testid="org-switcher"
              className="max-w-[10rem] rounded border border-hud-line bg-hud-bg px-2 py-1 text-[13px] text-hud-text outline-none focus:border-hud-accent"
              value={selectedAccountId ?? ""}
              onChange={(e) => selectAccount(e.target.value)}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </label>
          <div className="min-w-0 truncate text-[13px] text-hud-muted">
            {user?.displayName} <span className="text-hud-gold">(officer)</span>
            <Link
              to="/change-password"
              data-testid="change-password-link"
              className="ml-3 text-hud-muted underline underline-offset-2 hover:text-hud-text"
            >
              Change password
            </Link>
          </div>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          {accountsStatus === "loading" && (
            <p className="text-[13px] text-hud-muted">Loading client accounts…</p>
          )}
          {accountsStatus === "error" && (
            <p className="border-l-2 border-status-red pl-3 text-[13px] text-status-red" role="alert">
              {accountsError}
            </p>
          )}
          {accountsStatus === "ready" && !selectedAccountId && (
            <p className="text-[13px] text-hud-muted">No client accounts are configured.</p>
          )}
          {/* Keyed on the organisation, so switching remounts the page and it
              reloads for the new organisation rather than showing the old one. */}
          {accountsStatus === "ready" && selectedAccountId && <Outlet key={selectedAccountId} />}
        </main>
      </div>
    </div>
  );
}
