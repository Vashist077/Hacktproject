import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/subscriptions', label: 'Subscriptions', icon: '📱' },
    { path: '/alerts', label: 'Alerts', icon: '🚨' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div style={{
      width: '250px',
      background: '#fff',
      padding: '2rem 0',
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ padding: '0 2rem' }}>
        <h2 style={{ color: '#007bff', marginBottom: '2rem' }}>SubGuard</h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {menuItems.map((item) => (
            <li key={item.path} style={{ margin: '0.5rem 0' }}>
              <button
                onClick={() => navigate(item.path)}
                style={{
                  width: '100%',
                  background: location.pathname === item.path ? '#e3f2fd' : 'transparent',
                  border: 'none',
                  padding: '1rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: location.pathname === item.path ? '#007bff' : '#333',
                  fontSize: '1rem'
                }}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
