import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ChartCard from '../components/ChartCard';
import { analyticsAPI, alertsAPI, subscriptionsAPI, gmailAPI } from '../api';
import AlertCard from '../components/AlertCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ user, onLogout }) => {
  const [stats, setStats] = useState({
    activeSubscriptions: 0,
    monthlySpending: 0,
    fraudAlerts: 0,
    totalSavings: 0
  });

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [gmailConnected, setGmailConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError('');
      try {
        const [subsRes, alertsRes, spendRes, gmailStatusRes] = await Promise.all([
          subscriptionsAPI.getAll(),
          alertsAPI.getAll(),
          analyticsAPI.getSpendingOverTime('1month'),
          gmailAPI.getStatus().catch(() => ({ data: { connected: false } }))
        ]);

        const subs = Array.isArray(subsRes) ? subsRes : (subsRes?.data || subsRes?.subscriptions || []);
        const alerts = alertsRes?.data?.alerts || [];
        const monthlySpending = Array.isArray(spendRes?.data) ? spendRes.data.reduce((a, b) => a + (b.amount || 0), 0) : 0;

        setStats({
          activeSubscriptions: subs.filter(s => (s.status || 'active') === 'active').length,
          monthlySpending,
          fraudAlerts: alerts.filter(a => a.type === 'fraud' && (a.status || 'active') === 'active').length,
          totalSavings: 0
        });
        setRecentAlerts(alerts.slice(0, 5).map(a => ({
          id: a._id || a.id,
          type: a.type,
          title: a.title,
          merchant: a.merchant || a.subscription?.merchant || '',
          amount: a.amount || a.subscription?.amount || 0,
          date: a.date || a.createdAt,
          description: a.description
        })));
        setGmailConnected(gmailStatusRes.data?.connected || false);
      } catch (e) {
        setError('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Chart data
  const spendingData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Spending',
        data: [500, 1200, 2000, 1800, 2500, 2300],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.4
      },
    ],
  };

  const categoryData = {
    labels: ['Streaming', 'Software', 'Gaming', 'News', 'Other'],
    datasets: [
      {
        data: [35, 25, 20, 10, 10],
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'],
        borderWidth: 0
      },
    ],
  };

  const fraudData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    datasets: [
      {
        label: 'Fraud Cases',
        data: [2, 3, 7, 5, 4],
        backgroundColor: '#dc3545',
        borderRadius: 4
      },
    ],
  };

  const handleAlertAction = (action, alertId) => {
    console.log(`Alert action: ${action} for alert ${alertId}`);
    // Handle alert actions here
  };

  const handleGmailConnect = async () => {
    try {
      const result = await gmailAPI.connect();
      if (result.success) {
        window.open(result.data.authUrl, '_blank');
      } else if (result.setupRequired) {
        setError('Gmail OAuth not configured. Please set up Google Cloud credentials in the backend environment variables.');
      } else {
        setError(result.message || 'Failed to connect Gmail');
      }
    } catch (err) {
      setError('Failed to connect Gmail. Please check if Gmail OAuth is properly configured.');
    }
  };

  const handleGmailSync = async () => {
    setSyncing(true);
    try {
      const result = await gmailAPI.syncTransactions();
      if (result.success) {
        setError('');
        // Refresh dashboard data
        window.location.reload();
      } else {
        setError(result.message || 'Sync failed');
      }
    } catch (err) {
      setError('Failed to sync Gmail');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        
        {/* Main Content */}
        <div style={{ marginLeft: '250px', padding: '2rem', width: 'calc(100% - 250px)' }}>
          
          {/* Gmail Integration Controls */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333' }}>Gmail Integration</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              {!gmailConnected ? (
                <button
                  onClick={handleGmailConnect}
                  style={{
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Connect Gmail
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <span style={{ color: '#28a745', fontWeight: 'bold' }}>✓ Gmail Connected</span>
                  <button
                    onClick={handleGmailSync}
                    disabled={syncing}
                    style={{
                      background: syncing ? '#6c757d' : '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: syncing ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {syncing ? 'Syncing...' : 'Sync Transactions'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Top Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Active Subscriptions</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#007bff' }}>{stats.activeSubscriptions}</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Monthly Spending</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#28a745' }}>₹{stats.monthlySpending}</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Fraud Alerts</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#dc3545' }}>{stats.fraudAlerts}</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Total Savings</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#ffc107' }}>₹{stats.totalSavings}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <ChartCard title="Spending Over Time" height={300}>
              <Line data={spendingData} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
            
            <ChartCard title="Spending by Category" height={300}>
              <Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <ChartCard title="Fraud Detection Pattern" height={300}>
              <Bar data={fraudData} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
            
            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.25rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
                Recent Alerts
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {loading && (
                  <div style={{ textAlign: 'center', padding: '1rem', color: '#6c757d' }}>Loading...</div>
                )}
                {error && (
                  <div style={{ textAlign: 'center', padding: '1rem', color: '#dc3545' }}>{error}</div>
                )}
                {recentAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} onAction={handleAlertAction} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
