// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import LandingPage from "./pages/LandingPage";
import ContactPage from "./pages/ContactPage";
import MembershipPage from "./pages/MembershipPage";
import AboutUs from "./pages/AboutUs";
import OurTrainers from "./pages/OurTrainers";
import ClassesPage from "./pages/ClassesPage";
import TransactionPage from "./pages/TransactionPage";
import BookTrainer from "./pages/BookTrainer";
import ProfilePage from "./pages/ProfilePage";
import GCashPaymentPage from "./pages/GCashPaymentPage";
import ClassTransactionPage from "./pages/ClassTransactionPage";
import ClassDetailsPage from "./pages/ClassDetailsPage";
import AttendanceChecker from "./pages/AttendanceChecker";
import AttendancePage from "./pages/AttendancePage";

import AdminLandingPage from "./pages/AdminLandingPage";
import AdminCodeChecker from "./pages/AdminCodeChecker";
import AdminScheduleViewer from "./pages/AdminScheduleViewer";
import AdminSlotChecker from "./pages/AdminSlotChecker";

import ProtectedRoute from "./components/ProtectedRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected user routes */}
        <Route
          path="/landing"
          element={
            <ProtectedRoute>
              <LandingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <ContactPage />
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
          path="/about"
          element={
            <ProtectedRoute>
              <AboutUs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trainers"
          element={
            <ProtectedRoute>
              <OurTrainers />
            </ProtectedRoute>
          }
        />

        <Route
          path="/classes"
          element={
            <ProtectedRoute>
              <ClassesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/transaction"
          element={
            <ProtectedRoute>
              <TransactionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/gcash-payment"
          element={
            <ProtectedRoute>
              <GCashPaymentPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect if /book-trainer has no ID */}
        <Route
          path="/book-trainer"
          element={<Navigate to="/trainers" replace />}
        />

        {/* Dynamic Trainer Profile */}
        <Route
          path="/book-trainer/:trainerId"
          element={
            <ProtectedRoute>
              <BookTrainer />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Class routes */}
        <Route
          path="/class-transaction"
          element={
            <ProtectedRoute>
              <ClassTransactionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/class-details"
          element={
            <ProtectedRoute>
              <ClassDetailsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />

        {/* ✅ Admin routes (LOCK EVERYTHING UNDER /admin/*) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminRoutes />
            </ProtectedAdminRoute>
          }
        />

        {/* Optional: catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

/**
 * All admin-only pages live here.
 * Because this entire component is wrapped in ProtectedAdminRoute,
 * users can never access ANY /admin/... page unless they are admin.
 */
function AdminRoutes() {
  return (
    <Routes>
      <Route index element={<AdminLandingPage />} />
      <Route path="code-checker" element={<AdminCodeChecker />} />
      <Route path="schedule-viewer" element={<AdminScheduleViewer />} />
      <Route path="slot-checker" element={<AdminSlotChecker />} />
      <Route path="attendance-checker" element={<AttendanceChecker />} />

      {/* Safety fallback: unknown /admin/... goes back to /admin */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
