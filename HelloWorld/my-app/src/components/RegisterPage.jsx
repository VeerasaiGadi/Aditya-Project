import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:5000/register", {
        email,
        password,
      });

      if (response.data.success) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("Registration failed. Try again.");
    }
  };

  return (
    <div className="register-container">
      <div className="form_area">
        <h2>Register</h2>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        <form onSubmit={handleRegister}>
          <div className="form_group">
            
            <input
              type="email"
              placeholder="Enter your email"
              className="form_style"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form_group">
            
            <input
              type="password"
              placeholder="Enter your password"
              className="form_style"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form_group">
            <input
              type="password"
              placeholder="Confirm your password"
              className="form_style"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn">Register</button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
