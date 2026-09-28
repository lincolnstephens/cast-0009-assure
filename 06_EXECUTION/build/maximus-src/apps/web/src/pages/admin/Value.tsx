import { Link } from "react-router-dom";
import { AdminRecordPage } from "./Record";

/**
 * Value, on the operator's side (FRAGO 03 section 3.6). The inputs to the
 * client's Statement for the CFO under one name: the Record of work, and the
 * rates in Settings that price it. Nothing new is stored here; it is the
 * Record page with the way to the rates beside it.
 */
export function AdminValuePage() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 rounded border border-hud-line bg-hud-panel/40 px-4 py-3">
        <p className="text-[13px] text-hud-muted">
          The input on the client's Statement for the CFO: the record of work below, priced by
          the rates in Settings.
        </p>
        <Link
          to="/admin/settings"
          data-testid="value-settings-link"
          className="text-[13px] text-hud-accent underline"
        >
          Rates and names in Settings
        </Link>
      </div>
      <AdminRecordPage />
    </div>
  );
}
