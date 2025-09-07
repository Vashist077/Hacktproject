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
    activeSubscriptions: 14,
    monthlySpending: 4200,
    fraudAlerts: 3,
    totalSavings: 1200
  });

  const [recentAlerts, setRecentAlerts] = useState([
    {
      id: 1,
      type: 'fraud',
      title: 'Unknown Recurring Debit',
      merchant: 'XYZ Corp',
      amount: 999,
      date: '2024-01-15',
      description: 'Unrecognized recurring charge detected'
    },
    {
      id: 2,
      type: 'renewal',
      title: 'Netflix Renewal Due',
      merchant: 'Netflix',
      amount: 499,
      date: '2024-01-20',
      description: 'Your Netflix subscription will renew in 3 days'
    },
    {
      id: 3,
      type: 'unused',
      title: 'Unused Subscription',
      merchant: 'Adobe Creative Cloud',
      amount: 2299,
      date: '2024-01-10',
      description: 'No usage detected in the last 30 days'
    }
  ]);

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

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        
        {/* Main Content */}
        <div style={{ marginLeft: '250px', padding: '2rem', width: 'calc(100% - 250px)' }}>
          
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
            <ChartCard title="Spending Over Time">
              <Line data={spendingData} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
            
            <ChartCard title="Spending by Category">
              <Doughnut data={categoryData} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
          </div>

          {/* Bottom Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <ChartCard title="Fraud Detection Pattern">
              <Bar data={fraudData} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
            
            <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.25rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
                Recent Alerts
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
