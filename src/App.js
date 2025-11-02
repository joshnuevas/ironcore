import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import ContactPage from "./pages/ContactPage";
import MembershipPage from "./pages/MembershipPage";
import AboutUs from "./pages/AboutUs";
import OurTrainers from "./pages/OurTrainers"; 
import ClassesPage from "./pages/ClassesPage"; 
import TransactionPage from "./pages/TransactionPage";
import BookTrainer from "./pages/BookTrainer";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
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
          path="/book-trainer" 
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
      </Routes>
    </Router>
  );
}

export default App;