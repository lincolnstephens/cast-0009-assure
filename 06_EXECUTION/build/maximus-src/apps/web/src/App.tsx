import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { ClientLayout } from "./layouts/ClientLayout";
import { AdminPlaceholder } from "./pages/Placeholder";
import { AdminAlertsPage } from "./pages/admin/Alerts";
import { AdminAuditPage } from "./pages/admin/Audit";
import { AdminExportsPage } from "./pages/admin/Exports";
import { AdminClocksPage } from "./pages/admin/Clocks";
import { AdminPoliciesPage } from "./pages/admin/Policies";
import { AdminPosturePage } from "./pages/admin/Posture";
import { AdminRecordPage } from "./pages/admin/Record";
import { AdminSettingsPage } from "./pages/admin/Settings";
import { AdminReviewQueuePage } from "./pages/admin/ReviewQueue";
import { ClocksPage } from "./pages/client/Clocks";
import { ExposurePage } from "./pages/client/Exposure";
import { GuidePage } from "./pages/client/Guide";
import { PosturePage } from "./pages/client/Posture";
import { ValuePage } from "./pages/client/Value";
import { StatementPage } from "./pages/client/Statement";
import { LoginPage } from "./pages/Login";
import { RequireRole } from "./components/RequireRole";
import { useAuth } from "./store/auth";

export default function App() {
  const bootstrap = useAuth((s) => s.bootstrap);
  const status = useAuth((s) => s.status);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (status === "loading") {
    return (
      <div className="flex h-full items-center justify-center text-hud-muted">
        Loading…
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireRole role="client">
            <ClientLayout />
          </RequireRole>
        }
      >
        <Route index element={<GuidePage />} />
        <Route path="posture" element={<PosturePage />} />
        <Route path="clocks" element={<ClocksPage />} />
        <Route path="exposure" element={<ExposurePage />} />
        <Route path="value" element={<ValuePage />} />
        <Route path="value/statement" element={<StatementPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <RequireRole role="mitmark_admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminReviewQueuePage />} />
        <Route path="clocks" element={<AdminClocksPage />} />
        <Route path="policies" element={<AdminPoliciesPage />} />
        <Route path="posture" element={<AdminPosturePage />} />
        <Route path="record" element={<AdminRecordPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="alerts" element={<AdminAlertsPage />} />
        <Route path="exports" element={<AdminExportsPage />} />
        <Route path="audit" element={<AdminAuditPage />} />
        <Route path="users" element={<AdminPlaceholder title="Users" note="User management arrives in a later phase." />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
