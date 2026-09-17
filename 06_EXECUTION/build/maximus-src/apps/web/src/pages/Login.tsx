import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ApiError } from "../lib/api";
import { useAuth } from "../store/auth";

export function LoginPage() {
  const { status, user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (status === "authenticated" && user) {
    return <Navigate to={user.role === "mitmark_admin" ? "/admin" : "/"} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      const role = useAuth.getState().user?.role;
      navigate(role === "mitmark_admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="text-2xl font-semibold tracking-[0.3em] text-hud-text">MAXIMUS</div>
          <div className="mt-2 border-t border-hud-gold/60 pt-2 text-xs uppercase tracking-widest text-hud-muted">
            MITMARK Intelligence
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded border border-hud-line bg-hud-panel p-6 shadow-lg"
        >
          <label className="block text-sm text-hud-muted" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-hud-text outline-none focus:border-hud-accent"
          />

          <label className="mt-4 block text-sm text-hud-muted" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-hud-line bg-hud-bg px-3 py-2 text-hud-text outline-none focus:border-hud-accent"
          />

          {error && (
            <p className="mt-4 border-l-2 border-status-red pl-3 text-sm text-status-red" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded bg-hud-accent px-4 py-2 font-medium text-white hover:bg-hud-accent/90 disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
