import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedAdminRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/users/me", {
          withCredentials: true,
        });

        console.log("Admin check - User data:", response.data);
        console.log("Admin check - isAdmin value:", response.data.isAdmin);
        
        // Handle both boolean true and numeric 1
        if (response.data.isAdmin === true || response.data.isAdmin === 1) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        fontSize: "1.2rem",
        color: "#666"
      }}>
        Loading...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;