import type { ClientBranding, MeResponse, SessionUser } from "@maximus/shared";
import { create } from "zustand";
import { api, ApiError } from "../lib/api";

interface AuthState {
  status: "loading" | "anonymous" | "authenticated";
  user: SessionUser | null;
  officerName: string | null;
  branding: ClientBranding | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  officerName: null,
  branding: null,

  bootstrap: async () => {
    try {
      const me = await api<MeResponse>("/auth/me");
      set({
        status: "authenticated",
        user: me.user,
        officerName: me.officer?.displayName ?? null,
        branding: me.branding,
      });
    } catch {
      set({ status: "anonymous", user: null, officerName: null, branding: null });
    }
  },

  login: async (email, password) => {
    await api("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const me = await api<MeResponse>("/auth/me");
    set({
      status: "authenticated",
      user: me.user,
      officerName: me.officer?.displayName ?? null,
      branding: me.branding,
    });
  },

  logout: async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 401)) throw err;
    } finally {
      set({ status: "anonymous", user: null, officerName: null, branding: null });
    }
  },
}));
