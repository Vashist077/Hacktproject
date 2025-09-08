import React from 'react';

const ChartCard = ({ title, children, style = {}, height = 300 }) => {
  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '1.5rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      margin: '1rem 0',
      ...style
    }}>
      <h3 style={{ 
        margin: '0 0 1rem 0', 
        color: '#333', 
        fontSize: '1.25rem',
        borderBottom: '2px solid #e9ecef',
        paddingBottom: '0.5rem'
      }}>
        {title}
      </h3>
      <div style={{ position: 'relative', width: '100%', height }}>
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
