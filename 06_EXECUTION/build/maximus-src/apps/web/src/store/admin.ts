import { create } from "zustand";
import { api, ApiError } from "../lib/api";
import { rememberOrg, selectedOrg } from "../lib/org";

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
  selectedAccountId: selectedOrg(),
  accountsStatus: "loading",
  accountsError: null,

  loadAccounts: async () => {
    set({ accountsStatus: "loading", accountsError: null });
    try {
      const res = await api<{ accounts: Account[] }>("/admin/accounts");
      // Keep the remembered choice only if it still exists.
      const remembered = get().selectedAccountId;
      const selected = res.accounts.some((a) => a.id === remembered) ? remembered : (res.accounts[0]?.id ?? null);
      rememberOrg(selected);
      set({
        accounts: res.accounts,
        selectedAccountId: selected,
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

  selectAccount: (id) => {
    rememberOrg(id);
    set({ selectedAccountId: id });
  },
}));
