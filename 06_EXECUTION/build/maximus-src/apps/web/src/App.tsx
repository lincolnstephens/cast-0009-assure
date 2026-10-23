import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./layouts/AdminLayout";
import { ClientLayout } from "./layouts/ClientLayout";
import { AdminAlertsPage } from "./pages/admin/Alerts";
import { AdminAuditPage } from "./pages/admin/Audit";
import { AdminExportsPage } from "./pages/admin/Exports";
import { AdminClocksPage } from "./pages/admin/Clocks";
import { AdminPoliciesPage } from "./pages/admin/Policies";
import { AdminPosturePage } from "./pages/admin/Posture";
import { AdminProceduresPage } from "./pages/admin/Procedures";
import { AdminRecordPage } from "./pages/admin/Record";
import { AdminValuePage } from "./pages/admin/Value";
import { AdminClientViewPage } from "./pages/admin/ClientView";
import { AdminOrganisationsPage } from "./pages/admin/Organisations";
import { AdminUsersPage } from "./pages/admin/Users";
import { ChangePasswordPage } from "./pages/ChangePassword";
import { RequireSignedIn } from "./components/RequireRole";
import { AdminSettingsPage } from "./pages/admin/Settings";
import { AdminReviewQueuePage } from "./pages/admin/ReviewQueue";
import { AdminWorkplanPage } from "./pages/admin/Workplan";
import { AreaPageView } from "./pages/client/Area";
import { ClocksPage } from "./pages/client/Clocks";
// DOCUMENTS lane: these two are not built yet as this file lands. Wired here
// ahead of them (V12_BRIEF.md, task 7) - if the export name differs when
// they arrive, only this import line needs adjusting.
import { DocumentsPage } from "./pages/client/Documents";
import { AdminDocumentsPage } from "./pages/admin/Documents";
import { AdminFiguresPage } from "./pages/admin/Figures";
import { ExposurePage } from "./pages/client/Exposure";
import { GuidePage } from "./pages/client/Guide";
import { JobsPage } from "./pages/client/Jobs";
import { PosturePage } from "./pages/client/Posture";
import { TrackerPage } from "./pages/client/Tracker";
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
        path="/change-password"
        element={
          <RequireSignedIn>
            <ChangePasswordPage />
          </RequireSignedIn>
        }
      />

      <Route
        path="/"
        element={
          <RequireRole role="client">
            <ClientLayout />
          </RequireRole>
        }
      >
        {/* The Compliance Tracker is the client's front page: it answers the
            six questions before anything else is offered. The Policy Guide
            keeps its own address. */}
        <Route index element={<TrackerPage />} />
        <Route path="tracker" element={<TrackerPage />} />
        <Route path="guide" element={<GuidePage />} />
        <Route path="tracker/areas/:area" element={<AreaPageView />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="jobs" element={<JobsPage />} />
        {/* Posture and Exposure keep their routes live (v1.1 links still
            work) even though their menu items left the client nav at v1.2 -
            Posture is now the "Areas by status" panel on the tracker. */}
        <Route path="posture" element={<PosturePage />} />
        <Route path="clocks" element={<ClocksPage />} />
        <Route path="exposure" element={<ExposurePage />} />
        <Route path="value" element={<ValuePage />} />
        <Route path="value/statement" element={<StatementPage />} />
      </Route>

      {/* Outside AdminLayout on purpose: the admin workspace ends client
          view when it mounts, and this route is the one that starts it. */}
      <Route
        path="/admin/client-view"
        element={
          <RequireRole role="mitmark_admin">
            <AdminClientViewPage />
          </RequireRole>
        }
      />

      <Route
        path="/admin"
        element={
          <RequireRole role="mitmark_admin">
            <AdminLayout />
          </RequireRole>
        }
      >
        <Route index element={<AdminReviewQueuePage />} />
        <Route path="workplan" element={<AdminWorkplanPage />} />
        <Route path="documents" element={<AdminDocumentsPage />} />
        {/* Jobs is genuinely read-write on the operator's side (edit,
            reprioritise, close), which the client-facing Jobs page must
            never offer, so /admin/jobs points at the existing Workplan page
            rather than reusing that component (V12_BRIEF.md, task 7). */}
        <Route path="jobs" element={<AdminWorkplanPage />} />
        <Route path="clocks" element={<AdminClocksPage />} />
        <Route path="procedures" element={<AdminProceduresPage />} />
        <Route path="policies" element={<AdminPoliciesPage />} />
        <Route path="posture" element={<AdminPosturePage />} />
        <Route path="record" element={<AdminRecordPage />} />
        <Route path="value" element={<AdminValuePage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="figures" element={<AdminFiguresPage />} />
        <Route path="alerts" element={<AdminAlertsPage />} />
        <Route path="exports" element={<AdminExportsPage />} />
        <Route path="audit" element={<AdminAuditPage />} />
        <Route path="organisations" element={<AdminOrganisationsPage />} />
        <Route path="users" element={<AdminUsersPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
