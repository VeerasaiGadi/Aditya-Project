import { Routes, Route, Router, Navigate } from "react-router-dom";
import TableComponent from "./components/TableComponent";
import DetailsPage from "./components/DetailsPage";
import CompareColumns from "./components/CompareColumns";
import CompareRows from "./components/CompareRows";
import LoginPage from "./components/LoginPage"; 
import RegisterPage from "./components/RegisterPage"; 
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";
import './App.css';
import { useState,useEffect } from "react";
import ProtectedRoute from "./ProtectedRoute";

const App = () => {
  const [username, setUsername] = useState("");

  const handleLogin = (name) => {
    localStorage.setItem("username", name);
    setUsername(name);
  };

  return (
      <div>
        <Navbar/>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage/>} />
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/register" element={<RegisterPage />} />
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<TableComponent />} />
            <Route path="/details" element={<DetailsPage />} />
            <Route path="/compare" element={<CompareColumns />} />
            <Route path="/compare-rows" element={<CompareRows />} />
          </Route>
              {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    )
};

export default App;