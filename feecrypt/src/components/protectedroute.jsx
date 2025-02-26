import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem("isLoggedIn");
  return isAuthenticated ? children : <Navigate to="/not-found" />;
};

export default ProtectedRoute;
