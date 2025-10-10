import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import ContactPage from "./pages/ContactPage";
import MembershipPage from "./pages/MembershipPage";
import AboutUs from "./pages/AboutUs"; // ✅ add
import OurTrainers from "./pages/OurTrainers"; // ✅ add


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

        
      </Routes>
    </Router>
  );
}

export default App;
