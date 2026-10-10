import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventsPage } from './pages/EventsPage';
import { MerchCatalogPage } from './pages/MerchCatalogPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';

import { StudentDashboard } from './pages/StudentDashboard';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { MembershipPage } from './pages/MembershipPage';
import { StudentTasksPage } from './pages/StudentTasksPage';
import { ExpensesPage } from './pages/ExpensesPage';

import { OrganizerOverview } from './pages/OrganizerOverview';
import { MembersManagementPage } from './pages/MembersManagementPage';
import { EventsManagementPage } from './pages/EventsManagementPage';
import { QRScannerPage } from './pages/QRScannerPage';
import { MerchManagementPage } from './pages/MerchManagementPage';
import { TaskBoardPage } from './pages/TaskBoardPage';

import { RiskWorkspacePage } from './pages/RiskWorkspacePage';
import { SimulatorPage } from './pages/SimulatorPage';
import { FinancialLedgerPage } from './pages/FinancialLedgerPage';
import { HandoverReportPage } from './pages/HandoverReportPage';
import { EventReadinessPage } from './pages/EventReadinessPage';
import { ActionCenterPage } from './pages/ActionCenterPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public & Exploratory Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/merch" element={<MerchCatalogPage />} />
          <Route path="/announcements" element={<AnnouncementsPage />} />

          {/* Student Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tickets"
            element={
              <ProtectedRoute>
                <MyTicketsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/membership"
            element={
              <ProtectedRoute>
                <MembershipPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-tasks"
            element={
              <ProtectedRoute>
                <StudentTasksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MerchCatalogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />

          {/* Organizer Operations (Organizer, Treasurer, Admin) */}
          <Route
            path="/organizer/overview"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'treasurer']}>
                <OrganizerOverview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/members"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'treasurer']}>
                <MembersManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/events"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                <EventsManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/scanner"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'treasurer']}>
                <QRScannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/merch"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'treasurer']}>
                <MerchManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/organizer/tasks"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'admin', 'treasurer']}>
                <TaskBoardPage />
              </ProtectedRoute>
            }
          />

          {/* Executive & Signature Modules */}
          <Route
            path="/risk"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'treasurer', 'admin']}>
                <RiskWorkspacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/simulator"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'treasurer', 'admin']}>
                <SimulatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledger"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'treasurer', 'admin']}>
                <FinancialLedgerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handover"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'treasurer', 'admin']}>
                <HandoverReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/action-center"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'treasurer', 'admin']}>
                <ActionCenterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/readiness"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'treasurer', 'admin']}>
                <EventReadinessPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute allowedRoles={['organizer', 'treasurer', 'admin']}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
