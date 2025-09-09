import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import SubscriptionCard from '../components/SubscriptionCard';
import { subscriptionsAPI } from '../api';

const Subscriptions = ({ user, onLogout }) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await subscriptionsAPI.getAll();
        const items = Array.isArray(result) ? result : (result?.data || result?.subscriptions || []);
        setSubscriptions(items.map(s => ({
          id: s._id || s.id,
          name: s.name,
          category: s.category || s.merchant || '',
          amount: s.amount || 0,
          status: s.status || 'active',
          nextBilling: s.nextBilling || s.next_billing || '',
          usage: s.usage || 'High',
          lastUsed: s.lastUsed || s.last_used || ''
        })));
      } catch (e) {
        setError('Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, []);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const sortedSubscriptions = [...filteredSubscriptions].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return b.amount - a.amount;
      case 'nextBilling':
        return new Date(a.nextBilling) - new Date(b.nextBilling);
      case 'usage':
        const usageOrder = { 'High': 3, 'Medium': 2, 'Low': 1, 'None': 0 };
        return usageOrder[b.usage] - usageOrder[a.usage];
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleSubscriptionAction = (action, subscriptionId) => {
    console.log(`Subscription action: ${action} for subscription ${subscriptionId}`);
    // Handle subscription actions here
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    setUploading(true);
    setError('');
    setUploadMessage('');

    try {
      const result = await subscriptionsAPI.uploadCSV(file);
      
      if (result.success) {
        setUploadMessage(`Successfully imported ${result.data.imported} subscriptions`);
        // Refresh the subscriptions list
        const updatedResult = await subscriptionsAPI.getAll();
        const items = Array.isArray(updatedResult) ? updatedResult : (updatedResult?.data || updatedResult?.subscriptions || []);
        setSubscriptions(items.map(s => ({
          id: s._id || s.id,
          name: s.name,
          category: s.category || s.merchant || '',
          amount: s.amount || 0,
          status: s.status || 'active',
          nextBilling: s.nextBilling || s.next_billing || '',
          usage: s.usage || 'High',
          lastUsed: s.lastUsed || s.last_used || ''
        })));
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (err) {
      setError('Failed to upload CSV file');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      // Clear the file input
      event.target.value = '';
    }
  };

  const totalMonthlySpending = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + sub.amount, 0);

  const unusedSubscriptions = subscriptions.filter(sub => sub.usage === 'None').length;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', background: '#f4f6f9', minHeight: '100vh' }}>
      <Navbar user={user} onLogout={onLogout} />
      <div style={{ display: 'flex' }}>
        <Sidebar />
        
        {/* Main Content */}
        <div style={{ marginLeft: '250px', padding: '2rem', width: 'calc(100% - 250px)' }}>
          
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>My Subscriptions</h1>
            <p style={{ margin: 0, color: '#6c757d' }}>Manage and monitor your subscription services</p>
          </div>

          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Total Subscriptions</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#007bff' }}>{subscriptions.length}</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Monthly Spending</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#28a745' }}>₹{totalMonthlySpending}</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Unused Services</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#dc3545' }}>{unusedSubscriptions}</p>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>Active Services</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#28a745' }}>{subscriptions.filter(sub => sub.status === 'active').length}</p>
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
                  <option value="paused">Paused</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="unused">Unused</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#333', fontWeight: 'bold' }}>Sort by:</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                >
                  <option value="name">Name</option>
                  <option value="amount">Amount</option>
                  <option value="nextBilling">Next Billing</option>
                  <option value="usage">Usage</option>
                </select>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="csv-upload"
                />
                <label
                  htmlFor="csv-upload"
                  style={{
                    background: uploading ? '#6c757d' : '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    display: 'inline-block'
                  }}
                >
                  {uploading ? 'Uploading...' : 'Upload CSV'}
                </label>
              </div>
            </div>
          </div>

          {/* Subscriptions Grid */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>Loading subscriptions...</div>
          )}
          {error && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#dc3545' }}>{error}</div>
          )}
          {uploadMessage && (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#28a745' }}>{uploadMessage}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {sortedSubscriptions.map(subscription => (
              <SubscriptionCard 
                key={subscription.id} 
                subscription={subscription} 
                onAction={handleSubscriptionAction} 
              />
            ))}
          </div>

          {sortedSubscriptions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
              <h3>No subscriptions found</h3>
              <p>Try adjusting your filters or upload a CSV file to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
