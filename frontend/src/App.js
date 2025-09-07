import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import '@fortawesome/fontawesome-free/css/all.min.css';

// Import pages
import Login from './login';
import Dashboard from './pages/Dashboard';
import Subscriptions from './pages/Subscriptions';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app load
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(to right, #ebf8ff, #f0fff4)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#007bff' }}>SubGuard</h2>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isLoggedIn ? 
            <Navigate to="/dashboard" replace /> : 
            <Login onLogin={handleLogin} />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            isLoggedIn ? 
            <Dashboard user={user} onLogout={handleLogout} /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/subscriptions" 
          element={
            isLoggedIn ? 
            <Subscriptions user={user} onLogout={handleLogout} /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/alerts" 
          element={
            isLoggedIn ? 
            <Alerts user={user} onLogout={handleLogout} /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/analytics" 
          element={
            isLoggedIn ? 
            <Analytics user={user} onLogout={handleLogout} /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route 
          path="/settings" 
          element={
            isLoggedIn ? 
            <Settings user={user} onLogout={handleLogout} /> : 
            <Navigate to="/" replace />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;