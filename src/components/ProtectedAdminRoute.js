import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { loadToken } from "../utils/tokenStorage";

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = loadToken(); // ✅ use hidden token

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
        const response = await axios.get(
          "http://localhost:8080/api/users/me",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`, // ✅ decoded real token
            },
          }
        );

        const userIsAdmin =
          response.data.isAdmin === true || response.data.isAdmin === 1;

        setIsAuthenticated(true);
        setIsAdmin(userIsAdmin);
      } catch (error) {
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [token]);

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

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
