import React from 'react';

const SubscriptionCard = ({ subscription, onAction }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'paused': return '#ffc107';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      margin: '1rem 0',
      border: '1px solid #e9ecef'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ margin: 0, color: '#333', fontSize: '1.25rem' }}>{subscription.name}</h3>
          <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>{subscription.category}</p>
        </div>
        <span style={{
          background: getStatusColor(subscription.status),
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          textTransform: 'capitalize'
        }}>
          {subscription.status}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Amount</p>
          <p style={{ margin: 0, color: '#333', fontSize: '1.1rem', fontWeight: 'bold' }}>₹{subscription.amount}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Next Billing</p>
          <p style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>{formatDate(subscription.nextBilling)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onAction('remind', subscription.id)}
          style={{
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Remind
        </button>
        <button
          onClick={() => onAction('pause', subscription.id)}
          style={{
            background: '#ffc107',
            color: '#333',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Pause
        </button>
        <button
          onClick={() => onAction('cancel', subscription.id)}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => onAction('insights', subscription.id)}
          style={{
            background: '#6f42c1',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Insights
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCard;
