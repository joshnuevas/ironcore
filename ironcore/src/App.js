import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import LandingPage from "./pages/LandingPage";
import AboutUs from "./pages/AboutUs";
import OurTrainers from "./pages/OurTrainers";

// Inner App for navigation logic
function AppContent() {
  const navigate = useNavigate();

  // Handles navigation between pages
  const handleNavigate = (page) => {
    switch (page) {
      case "landing":
        navigate("/landing");
        break;
      case "about":
        navigate("/about");
        break;
      case "trainers":
        navigate("/trainers");
        break;
      case "login":
        navigate("/login");
        break;
      case "register":
        navigate("/register");
        break;
      default:
        break;
    }
  };

  return (
    <Routes>
      {/* Default route redirects to Login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Login page */}
      <Route path="/login" element={<Login />} />

      {/* Register page */}
      <Route path="/register" element={<Register />} />

      {/* Landing page after login */}
      <Route path="/landing" element={<LandingPage onNavigate={handleNavigate} />} />

      {/* About Us page */}
      <Route path="/about" element={<AboutUs onNavigate={handleNavigate} />} />

      {/* Our Trainers page */}
      <Route path="/trainers" element={<OurTrainers onNavigate={handleNavigate} />} />
    </Routes>
  );
}

// Wrap AppContent with Router
export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
