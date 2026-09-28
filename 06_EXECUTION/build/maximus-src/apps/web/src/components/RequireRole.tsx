import type { Role } from "@maximus/shared";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { previewOrg } from "../lib/preview";
import { useAuth } from "../store/auth";

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { status, user } = useAuth();
  const location = useLocation();

  if (status === "anonymous" || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // The operator may read the client portal in "View as client". Nothing
  // else crosses: the server refuses every write in that view.
  const previewing = role === "client" && user.role === "mitmark_admin" && previewOrg() !== null;
  if (user.role !== role && !previewing) {
    // Send each role to its own workspace rather than a dead end.
    return <Navigate to={user.role === "mitmark_admin" ? "/admin" : "/"} replace />;
  }
  return <>{children}</>;
}
