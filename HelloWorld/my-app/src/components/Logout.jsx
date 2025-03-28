import { useNavigate } from "react-router-dom";

const Logout = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      // Remove stored user credentials
      localStorage.removeItem("username");
      localStorage.removeItem("authToken"); // Ensure the auth token is removed
  
      // Redirect to login page
      navigate("/login");
    }
  };
  
  
  return (
    <button 
      onClick={handleLogout} 
      style={{ 
        padding: "8px 12px", 
        backgroundColor: "#f44336", 
        color: "white", 
        border: "none", 
        borderRadius: "5px", 
        cursor: "pointer" 
      }}
    >
      Logout
    </button>
  );
};

export default Logout;