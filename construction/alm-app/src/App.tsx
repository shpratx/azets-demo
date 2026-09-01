import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import ValidationPage from './pages/ValidationPage';
import MappingReviewPage from './pages/MappingReviewPage';
import ManualWorkbenchPage from './pages/ManualWorkbenchPage';
import ExceptionQueuePage from './pages/ExceptionQueuePage';
import CozoneSyncPage from './pages/CozoneSyncPage';
import AuditReportPage from './pages/AuditReportPage';
import HistoryPortalPage from './pages/HistoryPortalPage';
import BulkOperationsPage from './pages/BulkOperationsPage';
import MasterLedgerPage from './pages/MasterLedgerPage';
import RulesEnginePage from './pages/RulesEnginePage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import HelpSupportPage from './pages/HelpSupportPage';
import UserAdminPage from './pages/UserAdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login — no shell */}
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated shell */}
        <Route element={<AppShell />}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/upload"     element={<UploadPage />} />
          <Route path="/validation" element={<ValidationPage />} />
          <Route path="/mapping"    element={<MappingReviewPage />} />
          <Route path="/workbench"  element={<ManualWorkbenchPage />} />
          <Route path="/exceptions" element={<ExceptionQueuePage />} />
          <Route path="/sync"       element={<CozoneSyncPage />} />
          <Route path="/audit"      element={<AuditReportPage />} />
          <Route path="/history"    element={<HistoryPortalPage />} />
          <Route path="/bulk"       element={<BulkOperationsPage />} />
          <Route path="/ledger"     element={<MasterLedgerPage />} />
          <Route path="/rules"      element={<RulesEnginePage />} />
          <Route path="/analytics"  element={<AnalyticsDashboardPage />} />
          <Route path="/help"       element={<HelpSupportPage />} />
          <Route path="/users"      element={<UserAdminPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
