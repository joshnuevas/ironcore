// src/App.js
import React, { useMemo, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";

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

// ✅ token tamper utilities
import { hasTokenChanged, clearToken } from "./utils/tokenStorage";

function AppLayout() {
  const { pathname } = useLocation();

  // ✅ Auto-logout if token is edited/tampered in localStorage
  useEffect(() => {
    const logoutNow = () => {
      clearToken();
      localStorage.removeItem("loginRole");
      window.location.href = "/login";
    };

    const check = () => {
      if (hasTokenChanged()) {
        logoutNow();
      }
    };

    // check immediately and then every 1s
    check();
    const interval = setInterval(check, 1000);

    // also check when user returns to the tab
    document.addEventListener("visibilitychange", check);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  const activeNav = useMemo(() => {
    if (pathname.startsWith("/about")) return "ABOUT US";
    if (pathname.startsWith("/trainers")) return "OUR TRAINERS";
    if (pathname.startsWith("/classes")) return "CLASSES";
    if (pathname.startsWith("/membership")) return "MEMBERSHIP";
    if (pathname.startsWith("/attendance")) return "ATTENDANCE";
    if (pathname.startsWith("/profile")) return "PROFILE";
    if (pathname.startsWith("/contact")) return "CONTACT";
    if (pathname.startsWith("/admin")) return "ADMIN";
    return "HOME";
  }, [pathname]);

  return (
    <>
      <Navbar activeNav={activeNav} />
      <div
        style={{
          paddingTop: "90px",
          minHeight: "100vh",
          background: "transparent",
        }}
      >
        <Outlet />
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Layout + Protected Pages */}
        <Route element={<AppLayout />}>
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

          <Route path="/book-trainer" element={<Navigate to="/trainers" replace />} />

          <Route
            path="/book-trainer/:trainerId"
            element={
              <ProtectedRoute>
                <BookTrainer />
              </ProtectedRoute>
            }
          />

          {/* USER PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

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

          {/* ADMIN ROUTES (nested properly) */}
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <Outlet />
              </ProtectedAdminRoute>
            }
          >
            <Route index element={<AdminLandingPage />} />
            <Route path="code-checker" element={<AdminCodeChecker />} />
            <Route path="schedule-viewer" element={<AdminScheduleViewer />} />
            <Route path="slot-checker" element={<AdminSlotChecker />} />
            <Route path="attendance-checker" element={<AttendanceChecker />} />

            {/* ADMIN PROFILE */}
            <Route path="profile" element={<ProfilePage />} />

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
