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

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirects to Login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* Register page */}
        <Route path="/register" element={<Register />} />

        {/* Landing page after login */}
        <Route path="/landing" element={<LandingPage />} /> {/* ✅ Added this */}

        {/* Contact page (Protected Route) - NEW ROUTE */}
        <Route path="/contact" element={<ContactPage />} />

        {/* Membership page - NEW ROUTE */}
        <Route path="/membership" element={<MembershipPage />} />

        <Route path="/about" element={<AboutUs />} /> {/* ✅ added */}
        
        <Route path="/trainers" element={<OurTrainers />} /> {/* ✅ added */}

        <Route path="/classes" element={<ClassesPage />} />

        <Route path="/transaction" element={<TransactionPage />} />
        <Route path="/book-trainer" element={<BookTrainer />} />
        
      </Routes>
    </Router>
  );
}

export default App;
