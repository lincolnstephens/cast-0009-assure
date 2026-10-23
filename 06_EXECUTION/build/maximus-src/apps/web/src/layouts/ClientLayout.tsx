import { type ClientBranding, DEFAULT_BRANDING } from "@maximus/shared";
import type { CSSProperties } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { ClientLogo } from "../components/ClientLogo";
import { ClientPoweredBy, MitmarkWatermark } from "../components/ClientPoweredBy";
import { ClientViewBanner } from "../components/ClientViewBanner";
import { MitmarkLogo } from "../components/MitmarkLogo";
import { useAuth } from "../store/auth";

// `view` is the identifier the gate drives the product by. The label is what
// the Information Officer reads; the two are deliberately not the same
// string.
//
// v1.3 (FRAGO 03 section 3.1): six items in the operator's order. Value left
// the menu; /value still routes and the Statement links to it. The Policy
// Guide is back on the menu as Quick questions.
//
// v1.2 (FRAGO 02 section 4): the client navigation follows the operator's structure.
// Posture is folded into the tracker as its "Areas by status" panel, and the
// Policy Guide is no longer a menu item - it sits at the foot of Jobs and
// stays reachable from each module page. Their routes stay live in App.tsx
// so any existing link to /posture, /exposure or /guide still works; only
// the menu items go.
const navItems = [
  { to: "/", label: "Compliance Tracker", view: "tracker", end: true },
  { to: "/documents", label: "Compliance Documents", view: "documents" },
  { to: "/jobs", label: "Job management", view: "jobs" },
  { to: "/clocks", label: "Requests and clocks", view: "request" },
  { to: "/value/statement", label: "Statement for the CFO", view: "statement" },
  { to: "/guide", label: "Quick questions", view: "guide" },
];

export function ClientLayout() {
  const { officerName, branding, logout } = useAuth();
  const navigate = useNavigate();
  const theme = branding ?? null;

  return (
    <div
      className="client-portal flex min-h-full w-full flex-col bg-client-bg text-client-text"
      data-theme="day"
      style={theme ? brandingStyle(theme) : undefined}
    >
      <ClientViewBanner />
      <div className="flex min-h-0 w-full flex-1 flex-col sm:flex-row">
      <aside className="flex w-full shrink-0 flex-col border-b border-client-line bg-client-surface sm:w-44 sm:border-b-0 sm:border-r md:w-56">
        <div className="border-b border-client-line px-4 py-4 sm:px-5 sm:py-5">
          {theme ? (
            <ClientLogo branding={theme} place="sidebar" />
          ) : (
            <div className="text-sm font-semibold tracking-[0.25em] text-client-text">
              Client portal
            </div>
          )}
          <div className="mt-1 text-[11px] uppercase tracking-wider text-client-muted">
            Client portal
          </div>
        </div>
        <nav className="flex-1 bg-client-surface py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-view={item.view}
              className={({ isActive }) =>
                `block border-l-2 px-4 py-2.5 text-sm transition-colors sm:px-5 ${
                  isActive
                    ? "border-client-accent bg-client-surface font-medium text-client-accent"
                    : "border-transparent text-client-muted hover:text-client-text"
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
          className="border-t border-client-line bg-client-surface px-4 py-3 text-left text-sm text-client-muted hover:text-client-text sm:px-5"
        >
          Sign out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col bg-client-bg">
        {/* v1.9 (FRAGO 09 3.4): both marks, each once. The client's logo sits
            at the head of the menu only; the page header carries the MITMARK
            mark, right-aligned, with its words from 768px and the mark alone
            beneath. The officer's block moves to the left. */}
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-client-line bg-client-surface px-4 py-3 sm:px-8 sm:py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-client-line bg-client-surface text-xs font-semibold text-client-text"
            >
              {initials(officerName)}
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-sm text-client-text">
                {officerName ?? "MITMARK officer"}
              </div>
              <div className="text-[11px] text-client-muted">Your compliance officer</div>
            </div>
            <Link
              to="/change-password"
              data-testid="change-password-link"
              className="ml-2 text-[12px] text-client-muted underline underline-offset-2 hover:text-client-text"
            >
              Change password
            </Link>
          </div>
          <div data-testid="header-mitmark" className="ml-auto flex shrink-0 items-center gap-2">
            <MitmarkLogo className="h-5 w-auto" alt="MITMARK Intelligence" />
            <span
              data-testid="header-mitmark-words"
              className="hidden text-sm text-client-text md:inline"
            >
              {DEFAULT_BRANDING.poweredByText}
            </span>
          </div>
        </header>
        {/* v1.8 (FRAGO 08 3.3): from 640px the right padding is a gutter the
            content never enters, and the watermark sits in it beneath the
            content layer, so it is never under text. */}
        <main className="min-h-0 flex-1 overflow-y-auto bg-client-bg px-4 py-6 leading-relaxed text-client-text sm:py-10 sm:pl-8 sm:pr-24 md:pr-32">
          <div data-testid="client-content" className="relative z-[1]">
            <Outlet />
            <ClientPoweredBy />
          </div>
          <MitmarkWatermark />
        </main>
      </div>
      </div>
    </div>
  );
}

/**
 * The client portal's accent is the tenant's own colour only when the
 * operator has set one on branding.colors.accent. When it is empty the
 * portal falls through to the house accent token (see --color-client-accent
 * in index.css). No tenant colour is ever hardcoded here.
 */
function brandingStyle(branding: ClientBranding): CSSProperties | undefined {
  const accent = branding.colors.accent?.trim();
  if (!accent) return undefined;
  return { ["--client-accent" as string]: accent };
}

function initials(name: string | null): string {
  if (!name) return "MM";
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
