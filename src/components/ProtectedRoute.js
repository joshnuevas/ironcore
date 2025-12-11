import React from "react";
import { Navigate } from "react-router-dom";
import { loadToken } from "../utils/tokenStorage";

const ProtectedRoute = ({ children }) => {
  const token = loadToken(); // ✅ reads from ic_t and decodes

  if (!token) {
    // part of the session management feature
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
