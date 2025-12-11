import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // We still use the token just to know if user is logged in on the frontend
  const token = localStorage.getItem("token");

  useEffect(() => {
    const checkAdminAccess = async () => {
      // No token at all → definitely not logged in
      if (!token) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Ask backend who this user is
        const response = await axios.get(
          "http://localhost:8080/api/users/me",
          {
            withCredentials: true,
            headers: {
              // backend mainly uses HttpSession, but sending token is fine
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Admin route check - User data:", response.data);

        setIsAuthenticated(true);

        const userIsAdmin =
          response.data.isAdmin === true || response.data.isAdmin === 1;

        setIsAdmin(userIsAdmin);
      } catch (error) {
        console.error("Error checking admin access:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [token]);

  // ⏳ Still checking
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background:
            "linear-gradient(to bottom right, #111827, #1f2937, #000000)",
          color: "#fff",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(249, 115, 22, 0.3)",
            borderTopColor: "#f97316",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p
          style={{
            marginTop: "1rem",
            fontSize: "1.2rem",
            color: "#9ca3af",
          }}
        >
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

  // ❌ Not authenticated → back to login
  if (!isAuthenticated) {
    console.log("Not authenticated - redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // ❌ Authenticated but not admin → back to normal landing
  if (!isAdmin) {
    console.log("Not admin - redirecting to landing");
    return <Navigate to="/landing" replace />;
  }

  // ✅ Admin verified → allow access
  return children;
};

export default ProtectedAdminRoute;
