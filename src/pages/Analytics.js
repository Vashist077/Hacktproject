import React, { useState, useEffect } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
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

const Analytics = ({ user, onLogout }) => {
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Sample analytics data
  const spendingOverTime = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Total Spending',
        data: [3200, 3800, 4200, 3900, 4500, 4200],
        borderColor: '#007bff',
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Fraud Prevention Savings',
        data: [200, 500, 800, 600, 1200, 1000],
        borderColor: '#28a745',
        backgroundColor: 'rgba(40, 167, 69, 0.1)',
        fill: true,
        tension: 0.4
      }
    ],
  };

  const categoryDistribution = {
    labels: ['Streaming', 'Software', 'Gaming', 'News', 'Other'],
    datasets: [
      {
        data: [35, 25, 20, 10, 10],
        backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'],
        borderWidth: 0
      },
    ],
  };

  const fraudDetectionAccuracy = {
    labels: ['True Positives', 'False Positives', 'True Negatives', 'False Negatives'],
    datasets: [
      {
        data: [45, 5, 30, 2],
        backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#dc3545'],
        borderWidth: 0
      },
    ],
  };

  const monthlyForecast = {
    labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Predicted Spending',
        data: [4300, 4500, 4200, 4800, 4600, 4400],
        borderColor: '#6f42c1',
        backgroundColor: 'rgba(111, 66, 193, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Potential Savings',
        data: [800, 1000, 900, 1200, 1100, 1000],
        borderColor: '#20c997',
        backgroundColor: 'rgba(32, 201, 151, 0.1)',
        fill: true,
        tension: 0.4
      }
    ],
  };

  const topMerchants = {
    labels: ['Netflix', 'Spotify', 'Adobe', 'Amazon Prime', 'Microsoft'],
    datasets: [
      {
        label: 'Spending (₹)',
        data: [2994, 1194, 2299, 999, 699],
        backgroundColor: '#007bff',
        borderRadius: 4
      },
    ],
  };

  const insights = [
    {
      type: 'savings',
      title: 'Potential Monthly Savings',
      value: '₹1,200',
      description: 'You could save ₹1,200/month by canceling unused subscriptions',
      icon: '💰'
    },
    {
      type: 'fraud',
      title: 'Fraud Prevention',
      value: '95%',
      description: 'Our AI detected 95% of fraudulent transactions this month',
      icon: '🛡️'
    },
    {
      type: 'usage',
      title: 'Underutilized Services',
      value: '3',
      description: '3 subscriptions show low usage patterns',
      icon: '📊'
    },
    {
      type: 'trend',
      title: 'Spending Trend',
      value: '+12%',
      description: 'Monthly spending increased by 12% compared to last month',
      icon: '📈'
    }
  ];

  const recommendations = [
    {
      title: 'Cancel Adobe Creative Cloud',
      reason: 'No usage detected in 30 days',
      savings: '₹2,299/month',
      priority: 'high'
    },
    {
      title: 'Switch to Annual Netflix Plan',
      reason: 'Save 15% with annual billing',
      savings: '₹600/year',
      priority: 'medium'
    },
    {
      title: 'Pause Disney+ Hotstar',
      reason: 'Low usage detected',
      savings: '₹299/month',
      priority: 'low'
    }
  ];

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        
        {/* Main Content */}
        <div style={{ marginLeft: '250px', padding: '2rem', width: 'calc(100% - 250px)' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Analytics & Insights</h1>
            <p style={{ margin: 0, color: '#6c757d' }}>Comprehensive analysis of your subscription spending and fraud detection</p>
          </div>

          {/* Time Range Selector */}
          <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label style={{ color: '#333', fontWeight: 'bold' }}>Time Range:</label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
              >
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
          </div>

          {/* Key Insights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            {insights.map((insight, index) => (
              <div key={index} style={{ 
                background: '#fff', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: `2px solid ${insight.type === 'savings' ? '#28a745' : insight.type === 'fraud' ? '#dc3545' : insight.type === 'usage' ? '#ffc107' : '#007bff'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '2rem', marginRight: '1rem' }}>{insight.icon}</span>
                  <div>
                    <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>{insight.title}</h3>
                    <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>{insight.value}</p>
                  </div>
                </div>
                <p style={{ margin: 0, color: '#333', fontSize: '0.9rem', lineHeight: '1.4' }}>{insight.description}</p>
              </div>
            ))}
          </div>

          {/* Charts Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <ChartCard title="Spending Over Time">
              <Line data={spendingOverTime} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
            
            <ChartCard title="Category Distribution">
              <Doughnut data={categoryDistribution} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
          </div>

          {/* Charts Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <ChartCard title="Fraud Detection Accuracy">
              <Pie data={fraudDetectionAccuracy} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
            
            <ChartCard title="Top Merchants by Spending">
              <Bar data={topMerchants} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
          </div>

          {/* Forecast Chart */}
          <div style={{ marginBottom: '2rem' }}>
            <ChartCard title="Monthly Forecast & Potential Savings">
              <Line data={monthlyForecast} options={{ responsive: true, maintainAspectRatio: false }} />
            </ChartCard>
          </div>

          {/* Recommendations */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#333', fontSize: '1.25rem', borderBottom: '2px solid #e9ecef', paddingBottom: '0.5rem' }}>
              💡 Recommendations
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.map((rec, index) => (
                <div key={index} style={{
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `2px solid ${rec.priority === 'high' ? '#dc3545' : rec.priority === 'medium' ? '#ffc107' : '#28a745'}`,
                  background: `${rec.priority === 'high' ? '#fff5f5' : rec.priority === 'medium' ? '#fffbf0' : '#f8fff8'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>{rec.title}</h4>
                    <span style={{
                      background: rec.priority === 'high' ? '#dc3545' : rec.priority === 'medium' ? '#ffc107' : '#28a745',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      textTransform: 'capitalize'
                    }}>
                      {rec.priority} priority
                    </span>
                  </div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d' }}>{rec.reason}</p>
                  <p style={{ margin: 0, color: '#28a745', fontWeight: 'bold' }}>Potential Savings: {rec.savings}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
