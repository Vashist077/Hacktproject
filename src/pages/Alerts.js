import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AlertCard from '../components/AlertCard';

const Alerts = ({ user, onLogout }) => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'fraud',
      title: 'Unknown Recurring Debit',
      merchant: 'XYZ Corp',
      amount: 999,
      date: '2024-01-15',
      description: 'Unrecognized recurring charge detected from an unknown merchant. This could be fraudulent activity.',
      status: 'active'
    },
    {
      id: 2,
      type: 'unused',
      title: 'Unused Subscription Detected',
      merchant: 'Adobe Creative Cloud',
      amount: 2299,
      date: '2024-01-10',
      description: 'No usage detected in the last 30 days. Consider canceling to save money.',
      status: 'active'
    },
    {
      id: 3,
      type: 'price_increase',
      title: 'Price Increase Alert',
      merchant: 'Netflix',
      amount: 499,
      date: '2024-01-20',
      description: 'Netflix subscription price increased from ₹399 to ₹499. Review if you want to continue.',
      status: 'active'
    },
    {
      id: 4,
      type: 'renewal',
      title: 'Upcoming Renewal',
      merchant: 'Spotify Premium',
      amount: 199,
      date: '2024-01-25',
      description: 'Your Spotify Premium subscription will renew in 3 days.',
      status: 'active'
    },
    {
      id: 5,
      type: 'fraud',
      title: 'Suspicious Transaction',
      merchant: 'Unknown Services',
      amount: 1500,
      date: '2024-01-12',
      description: 'Large amount charged to an unrecognized merchant. Please verify this transaction.',
      status: 'resolved'
    },
    {
      id: 6,
      type: 'unused',
      title: 'Low Usage Subscription',
      merchant: 'Disney+ Hotstar',
      amount: 299,
      date: '2024-01-08',
      description: 'Very low usage detected. Consider pausing or canceling this subscription.',
      status: 'resolved'
    }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.status === filter;
  });

  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.amount - a.amount;
      case 'date':
        return new Date(b.date) - new Date(a.date);
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });

  const handleAlertAction = (action, alertId) => {
    console.log(`Alert action: ${action} for alert ${alertId}`);
    
    if (action === 'resolve') {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'resolved' } : alert
      ));
    } else if (action === 'ignore') {
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'ignored' } : alert
      ));
    }
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved').length;
  const fraudAlerts = alerts.filter(alert => alert.type === 'fraud' && alert.status === 'active').length;
  const totalAmountAtRisk = alerts
    .filter(alert => alert.status === 'active' && (alert.type === 'fraud' || alert.type === 'unused'))
    .reduce((sum, alert) => sum + alert.amount, 0);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        
        {/* Main Content */}
        <div style={{ marginLeft: '250px', padding: '2rem', width: 'calc(100% - 250px)' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Security Alerts</h1>
            <p style={{ margin: 0, color: '#6c757d' }}>Monitor and manage fraud alerts and subscription issues</p>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Active Alerts</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#dc3545' }}>{activeAlerts}</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Resolved Alerts</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#28a745' }}>{resolvedAlerts}</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Fraud Alerts</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#dc3545' }}>{fraudAlerts}</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Amount at Risk</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#ffc107' }}>₹{totalAmountAtRisk}</p>
            </div>
          </div>

          {/* Filters and Controls */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>Filter by Status:</label>
                <select 
                  value={filter} 
                  onChange={(e) => setFilter(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="ignored">Ignored</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="date">Date</option>
                  <option value="amount">Amount</option>
                  <option value="type">Type</option>
                </select>
              </div>
              <button style={{
                background: '#28a745',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '1.5rem'
              }}>
                Mark All as Read
              </button>
            </div>
          </div>

          {/* Alerts List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedAlerts.map(alert => (
              <AlertCard 
                key={alert.id} 
                alert={alert} 
                onAction={handleAlertAction} 
              />
            ))}
          </div>

          {sortedAlerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
              <h3>No alerts found</h3>
              <p>Great! You have no active alerts at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
