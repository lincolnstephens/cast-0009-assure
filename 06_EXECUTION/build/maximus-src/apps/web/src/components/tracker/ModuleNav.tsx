import { NavLink } from "react-router-dom";
import { AREAS } from "@maximus/shared";

/**
 * The eight modules, one click away from wherever this sits. The operator's
 * requirement: a module page is never more than one click from anywhere in
 * the Compliance Tracker (FRAGO §4). Renders straight off `AREAS`, so a
 * rename there needs no change here.
 */
export function ModuleNav() {
  return (
    <nav aria-label="Modules" data-testid="module-nav" className="print:hidden">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-client-muted">
        Modules
      </p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {AREAS.map((area) => (
          <li key={area.id}>
            <NavLink
              to={`/tracker/areas/${area.id}`}
              data-testid="module-nav-item"
              className={({ isActive }) =>
                `inline-block rounded border px-2.5 py-1.5 text-[12px] transition-colors ${
                  isActive
                    ? "border-client-accent bg-client-accent/10 font-medium text-client-accent"
                    : "border-client-line text-client-muted hover:text-client-text"
                }`
              }
            >
              {area.id}. {area.name}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
