import { useAuth } from "../store/auth";
import { previewOrg } from "./preview";

/** True only for an operator reading the client portal. A client never sees preview state. */
export function usePreviewing(): boolean {
  const role = useAuth((s) => s.user?.role);
  return role === "mitmark_admin" && previewOrg() !== null;
}
