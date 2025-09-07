import React from 'react';

const AlertCard = ({ alert, onAction }) => {
  const getAlertTypeColor = (type) => {
    switch (type) {
      case 'fraud': return '#dc3545';
      case 'unused': return '#ffc107';
      case 'price_increase': return '#fd7e14';
      case 'renewal': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'fraud': return '🚨';
      case 'unused': return '⚠️';
      case 'price_increase': return '📈';
      case 'renewal': return '⏰';
      default: return 'ℹ️';
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
      border: `2px solid ${getAlertTypeColor(alert.type)}`,
      borderLeft: `6px solid ${getAlertTypeColor(alert.type)}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>{getAlertIcon(alert.type)}</span>
          <div>
            <h3 style={{ margin: 0, color: '#333', fontSize: '1.25rem' }}>{alert.title}</h3>
            <p style={{ margin: '0.25rem 0', color: '#6c757d', fontSize: '0.9rem' }}>{alert.merchant}</p>
          </div>
        </div>
        <span style={{
          background: getAlertTypeColor(alert.type),
          color: 'white',
          padding: '0.25rem 0.75rem',
          borderRadius: '20px',
          fontSize: '0.8rem',
          textTransform: 'capitalize'
        }}>
          {alert.type.replace('_', ' ')}
        </span>
      </div>

      <p style={{ color: '#333', marginBottom: '1rem', lineHeight: '1.5' }}>{alert.description}</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Amount</p>
          <p style={{ margin: 0, color: '#333', fontSize: '1.1rem', fontWeight: 'bold' }}>₹{alert.amount}</p>
        </div>
        <div>
          <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>Date</p>
          <p style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>{formatDate(alert.date)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onAction('resolve', alert.id)}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Resolve
        </button>
        <button
          onClick={() => onAction('pause', alert.id)}
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
          onClick={() => onAction('investigate', alert.id)}
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
          Investigate
        </button>
        <button
          onClick={() => onAction('ignore', alert.id)}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Ignore
        </button>
      </div>
    </div>
  );
};

export default AlertCard;
