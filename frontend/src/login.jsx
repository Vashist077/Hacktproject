import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "./api";

export default function Login({ onLogin }) {
  const [showLogin, setShowLogin] = useState(true);
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupfirstName, setSignupfirstName] = useState("");
  const [signuplastName, setSignuplastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    if (!loginEmail || !loginPassword) {
      setError("Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(loginEmail, loginPassword);
      const token = res?.token || res?.data?.token;
      const user = res?.user || res?.data?.user || { email: loginEmail };
      if (token) {
        localStorage.setItem("token", token);
      }
      if (onLogin) onLogin({ ...user, token });
      navigate("/dashboard");
    } catch (e) {
      setError("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError("");
    if (!signupfirstName || !signuplastName || !signupEmail || !signupPassword) {
      setError("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.register({
        firstName: signupfirstName,
        lastName: signuplastName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
      });
      const token = res?.token || res?.data?.token;
      const user = res?.user || res?.data?.user || { firstName: signupfirstName, lastName: signuplastName, email: signupEmail, phone: signupPhone };
      if (token) {
        localStorage.setItem("token", token);
        if (onLogin) onLogin({ ...user, token });
        navigate("/dashboard");
      } else {
        setShowLogin(true);
      }
    } catch (e) {
      setError("Signup failed. Try a different email or check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(to right, #ebf8ff, #f0fff4)",
      }}
    >
      {showLogin ? (
        <div
          style={{
            width: "350px",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
            background: "white",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "#333" }}>SubGuard Login</h2>
          {error && (
            <div style={{ color: "#dc3545", marginBottom: "8px" }}>{error}</div>
          )}
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              width: "90%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Enter your password"
            style={{
              width: "90%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />
          <br />
          <button
            style={{
              width: "95%",
              padding: "10px",
              marginTop: "15px",
              border: "none",
              background: "#3498db",
              color: "white",
              fontSize: "16px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          <p
            style={{ marginTop: "15px", color: "#3498db", cursor: "pointer" }}
            onClick={() => setShowLogin(false)}
          >
            Don’t have an account? Sign Up
          </p>
        </div>
      ) : (
        <div
          style={{
            width: "350px",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.2)",
            background: "white",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "20px", color: "#333" }}>SubGuard Signup</h2>
          {error && (
            <div style={{ color: "#dc3545", marginBottom: "8px" }}>{error}</div>
          )}
          <input
            type="text"
            placeholder="Enter your first name"
            style={{
              width: "90%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            value={signupfirstName}
            onChange={(e) => setSignupfirstName(e.target.value)}
          />
          <br />
          <input
            type="text"
            placeholder="Enter your last name"
            style={{
              width: "90%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            value={signuplastName}
            onChange={(e) => setSignuplastName(e.target.value)}
          />
          <br />
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              width: "90%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            value={signupEmail}
            onChange={(e) => setSignupEmail(e.target.value)}
          />
          <br />
          <input
            type="tel"
            placeholder="Enter your phone number"
            style={{
              width: "90%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            value={signupPhone}
            onChange={(e) => setSignupPhone(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Enter your password"
            style={{
              width: "90%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
            value={signupPassword}
            onChange={(e) => setSignupPassword(e.target.value)}
          />
          <br />
          <button
            style={{
              width: "95%",
              padding: "10px",
              marginTop: "15px",
              border: "none",
              background: "#2ecc71",
              color: "white",
              fontSize: "16px",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={handleSignup}
            disabled={loading}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
          <p
            style={{ marginTop: "15px", color: "#3498db", cursor: "pointer" }}
            onClick={() => setShowLogin(true)}
          >
            Already have an account? Login
          </p>
        </div>
      )}
    </div>
  );
}