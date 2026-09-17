import { create } from "zustand";
import { api, ApiError } from "../lib/api";

interface Account {
  id: string;
  name: string;
}

type AccountsStatus = "loading" | "ready" | "error";

interface AdminState {
  accounts: Account[];
  selectedAccountId: string | null;
  accountsStatus: AccountsStatus;
  accountsError: string | null;
  loadAccounts: () => Promise<void>;
  selectAccount: (id: string) => void;
}

export const useAdmin = create<AdminState>((set, get) => ({
  accounts: [],
  selectedAccountId: null,
  accountsStatus: "loading",
  accountsError: null,

  loadAccounts: async () => {
    set({ accountsStatus: "loading", accountsError: null });
    try {
      const res = await api<{ accounts: Account[] }>("/admin/accounts");
      set({
        accounts: res.accounts,
        selectedAccountId: get().selectedAccountId ?? res.accounts[0]?.id ?? null,
        accountsStatus: "ready",
        accountsError: null,
      });
    } catch (err) {
      set({
        accountsStatus: "error",
        accountsError:
          err instanceof ApiError
            ? err.message
            : "Unable to load client accounts. Refresh to try again.",
      });
    }
  },

  selectAccount: (id) => set({ selectedAccountId: id }),
}));
