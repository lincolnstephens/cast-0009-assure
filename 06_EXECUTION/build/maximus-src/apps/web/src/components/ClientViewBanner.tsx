import { useNavigate } from "react-router-dom";
import { endPreview } from "../lib/preview";
import { usePreviewing } from "../lib/usePreviewing";
import { useAuth } from "../store/auth";

/**
 * The one thing "View as client" adds to the client portal (FRAGO 04 3.2).
 * Rendered only for an operator session in client view, so the client seat
 * can never see it. Fixed to the top; on a phone the text wraps and it stays
 * in view.
 */
export function ClientViewBanner() {
  const previewing = usePreviewing();
  const refresh = useAuth((s) => s.refresh);
  const navigate = useNavigate();
  if (!previewing) return null;

  async function leave() {
    endPreview();
    await refresh().catch(() => undefined);
    navigate("/admin");
  }

  return (
    <div
      data-testid="client-view-banner"
      role="status"
      className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-client-text px-4 py-2 text-[13px] text-white print:hidden sm:px-8"
    >
      <span>
        Viewing as the client's Information Officer. Read only. Cards cannot be dragged here. Run
        the monthly review from Job management on the MITMARK side.
      </span>
      <button
        type="button"
        data-testid="client-view-return"
        onClick={() => void leave()}
        className="font-semibold underline underline-offset-2"
      >
        Return to admin.
      </button>
    </div>
  );
}
