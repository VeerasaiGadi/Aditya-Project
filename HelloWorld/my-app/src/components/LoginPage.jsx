import { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation} from "react-router-dom";
import "./LoginPage.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await axios.post("http://127.0.0.1:5000/login", {
        email,
        password,
      });
  
      if (response.data.success) {
        // Store the authentication token
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("username", email.split("@")[0]);
  
        navigate("/home"); // Redirect to home
      } else if (response.data.message === "User not found") {
        navigate("/register"); // Redirect to registration page
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };
  
  

  return (
    <div className="login-container">
    {location.state?.message && <p className="error-message">{location.state.message}</p>}

      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        <button type="submit">Login</button>
      </form>
      <p className="register-link">
        Don't have an account? <span onClick={() => navigate("/register")} className="link">Register here</span>
      </p>
    </div>
  );
};

export default LoginPage;