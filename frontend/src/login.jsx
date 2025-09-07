import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [showLogin, setShowLogin] = useState(true);
  const navigate = useNavigate();

  const handleLogin = () => {
    // You can add validation here if needed
    if (onLogin) {
      // Mock user data for demo
      const userData = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        token: 'mock-jwt-token'
      };
      onLogin(userData);
    }
    navigate("/dashboard");
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
          >
            Login
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
          <input
            type="text"
            placeholder="Enter your name"
            style={{
              width: "90%",
              padding: "10px",
              margin: "8px 0",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
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
            onClick={() => {
              // Mock signup logic for demo
              const userData = {
                id: 1,
                name: 'John Doe',
                email: 'john@example.com',
                token: 'mock-jwt-token'
              };
              if (onLogin) onLogin(userData);
              navigate("/dashboard");
            }}
          >
            Sign Up
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