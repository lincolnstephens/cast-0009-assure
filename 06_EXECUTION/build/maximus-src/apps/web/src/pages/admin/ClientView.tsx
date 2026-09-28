import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startPreview } from "../../lib/preview";
import { useAdmin } from "../../store/admin";
import { useAuth } from "../../store/auth";

/**
 * "View as client": opens the client portal for the operator's selected
 * organisation, read only. The organisation is explicit, so a second client
 * account needs no change here, only a choice of account.
 */
export function AdminClientViewPage() {
  const { selectedAccountId, accountsStatus, loadAccounts } = useAdmin();
  const refresh = useAuth((s) => s.refresh);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAccountId) void loadAccounts();
    // Once on arrival; the account list does not change under this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedAccountId) return;
    startPreview(selectedAccountId);
    refresh()
      .then(() => navigate("/", { replace: true }))
      .catch(() => setError("Unable to open client view."));
  }, [selectedAccountId, refresh, navigate]);

  return (
    <div className="flex h-full items-center justify-center p-6 text-[13px] text-hud-muted">
      {error ?? (accountsStatus === "ready" && !selectedAccountId ? "No client accounts are configured." : "Opening client view…")}
    </div>
  );
}
