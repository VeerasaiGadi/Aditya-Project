import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const username = localStorage.getItem("username"); // Check if user is logged in

  return username ? <Outlet /> :
  <Navigate to="/login" replace state={{ message: "Please login to continue" }} />
 
  
};

export default ProtectedRoute;
