import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PASSWORD_MIN_LENGTH, PASSWORD_RULE } from "@maximus/shared";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../store/auth";

/**
 * Change password (FRAGO 05 3.3). Reached from the header on either side, and
 * forced before anything else for a user holding a one-time password. The
 * server enforces the same rule and ends every other session; this page
 * states the rule rather than scoring the password.
 */
export function ChangePasswordPage() {
  const user = useAuth((s) => s.user);
  const refresh = useAuth((s) => s.refresh);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const forced = user?.mustChangePassword === true;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const newPassword = String(form.get("newPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");
    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      setError(`The new password must be ${PASSWORD_RULE.toLowerCase().replace(/\.$/, "")}.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("The two new passwords do not match.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api("/auth/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      await refresh();
      const role = useAuth.getState().user?.role;
      navigate(role === "mitmark_admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That did not go through. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-hud-bg p-4 text-hud-text">
      <form
        onSubmit={(e) => void submit(e)}
        data-testid="change-password-form"
        className="w-full max-w-sm rounded border border-hud-line bg-hud-panel/60 p-6"
      >
        <h1 className="text-lg font-semibold">{forced ? "Set your password" : "Change password"}</h1>
        <p className="mt-1 text-[13px] text-hud-muted">
          {forced
            ? "You signed in with a one-time password. Choose your own before you continue."
            : "Changing your password signs you out everywhere else."}
        </p>
        <p data-testid="password-rule" className="mt-3 text-[13px] font-medium">
          {PASSWORD_RULE}
        </p>

        <label className="mt-4 block text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
            {forced ? "One-time password" : "Current password"}
          </span>
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </label>
        <label className="mt-3 block text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">New password</span>
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            required
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </label>
        <label className="mt-3 block text-[13px]">
          <span className="mb-1 block text-[11px] uppercase tracking-wider text-hud-muted">
            New password again
          </span>
          <input
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={PASSWORD_MIN_LENGTH}
            required
            className="w-full rounded border border-hud-line bg-hud-bg px-2 py-1.5 text-[13px]"
          />
        </label>

        {error && (
          <p role="alert" className="mt-3 border-l-2 border-status-red pl-3 text-[13px] text-status-red">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded bg-hud-accent px-4 py-2 text-[13px] font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save password"}
          </button>
          {forced ? (
            <button
              type="button"
              onClick={() => void logout().then(() => navigate("/login"))}
              className="text-[13px] text-hud-muted underline underline-offset-2"
            >
              Sign out
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-[13px] text-hud-muted underline underline-offset-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
