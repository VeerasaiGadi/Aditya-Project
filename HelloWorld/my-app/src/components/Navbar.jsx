import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";
import Switch from "./darkmode";

const Navbar = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const location = useLocation(); // Add this to detect route changes

  // Check for username whenever the component renders or route changes
  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUsername(storedUser.charAt(0).toUpperCase() + storedUser.slice(1));
    } else {
      setUsername("");
    }
  }, [location.pathname]); // This will re-run when the route changes

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername("");
    navigate("/login");
  };

  return (
    <div className="navbar-div">
      {username ? (
        <>
          <span style={{ marginRight: "11px"   }}>Welcome, {username}</span>
          <button style={{justifyContent:"space-evenly", padding: "8px 12px", backgroundColor: "#f44336", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={handleLogout} className="logout-btn">Logout</button>
        </>
      ) : null}
      <Switch  />
    </div>
  );
};
export default Navbar;