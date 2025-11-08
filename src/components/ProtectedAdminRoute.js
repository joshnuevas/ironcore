import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // First check if user is logged in and get their data
        const response = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });

        console.log("Admin route check - User data:", response.data);
        
        // User is authenticated
        setIsAuthenticated(true);
        
        // Check if user is admin (handle both boolean true and numeric 1)
        const userIsAdmin = response.data.isAdmin === true || response.data.isAdmin === 1;
        
        // Also check if they selected admin role during login
        const loginRole = localStorage.getItem("loginRole");
        
        console.log("User isAdmin:", userIsAdmin);
        console.log("Login role:", loginRole);
        
        // User must be admin AND have selected admin role
        if (userIsAdmin && loginRole === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
        
      } catch (error) {
        console.error("Error checking admin access:", error);
        // If request fails, user is not authenticated
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, []);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(to bottom right, #111827, #1f2937, #000000)",
        color: "#fff"
      }}>
        <div style={{
          width: "50px",
          height: "50px",
          border: "4px solid rgba(249, 115, 22, 0.3)",
          borderTopColor: "#f97316",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}></div>
        <p style={{
          marginTop: "1rem",
          fontSize: "1.2rem",
          color: "#9ca3af"
        }}>
          Verifying access...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If authenticated but not admin, redirect to landing page
  if (!isAdmin) {
    console.log("Not admin - redirecting to landing");
    return <Navigate to="/landing" replace />;
  }

  // User is authenticated and is admin - allow access
  return children;
};

export default ProtectedAdminRoute;