import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const Settings = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      email: user?.email || 'john@example.com',
      phone: user?.phone || '+1234567890'
    },
    notifications: {
      email: {
        enabled: true,
        fraudAlerts: true,
        renewalReminders: true,
        spendingAlerts: true
      },
      sms: {
        enabled: false,
        fraudAlerts: true,
        renewalReminders: false
      },
      push: {
        enabled: true,
        fraudAlerts: true,
        renewalReminders: true
      }
    },
    preferences: {
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      language: 'en'
    },
    security: {
      twoFactorAuth: false,
      loginNotifications: true,
      sessionTimeout: 30
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async (section) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage(`${section} settings saved successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error saving ${section} settings`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async (type) => {
    setIsLoading(true);
    try {
      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage(`Test ${type} notification sent!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Error sending test ${type} notification`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderProfileTab = () => (
    <div style={{ maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Profile Information</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            First Name
          </label>
          <input
            type="text"
            value={settings.profile.firstName}
            onChange={(e) => handleInputChange('profile', 'firstName', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
            Last Name
          </label>
          <input
            type="text"
            value={settings.profile.lastName}
            onChange={(e) => handleInputChange('profile', 'lastName', e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
          Email Address
        </label>
        <input
          type="email"
          value={settings.profile.email}
          onChange={(e) => handleInputChange('profile', 'email', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        />
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
          Phone Number
        </label>
        <input
          type="tel"
          value={settings.profile.phone}
          onChange={(e) => handleInputChange('profile', 'phone', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        />
      </div>

      <button
        onClick={() => handleSave('Profile')}
        disabled={isLoading}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Saving...' : 'Save Profile'}
      </button>
    </div>
  );

  const renderNotificationsTab = () => (
    <div style={{ maxWidth: '800px' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Notification Settings</h3>
      
      {/* Email Notifications */}
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#333' }}>📧 Email Notifications</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={settings.notifications.email.enabled}
            onChange={(e) => handleNestedInputChange('notifications', 'email', 'enabled', e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          <label style={{ fontWeight: 'bold' }}>Enable Email Notifications</label>
        </div>

        {settings.notifications.email.enabled && (
          <div style={{ marginLeft: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.notifications.email.fraudAlerts}
                onChange={(e) => handleNestedInputChange('notifications', 'email', 'fraudAlerts', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label>Fraud Alerts</label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.notifications.email.renewalReminders}
                onChange={(e) => handleNestedInputChange('notifications', 'email', 'renewalReminders', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label>Renewal Reminders</label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.notifications.email.spendingAlerts}
                onChange={(e) => handleNestedInputChange('notifications', 'email', 'spendingAlerts', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label>Spending Alerts</label>
            </div>
          </div>
        )}

        <button
          onClick={() => handleTestNotification('email')}
          disabled={isLoading}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          Send Test Email
        </button>
      </div>

      {/* SMS Notifications */}
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#333' }}>📱 SMS Notifications</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={settings.notifications.sms.enabled}
            onChange={(e) => handleNestedInputChange('notifications', 'sms', 'enabled', e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          <label style={{ fontWeight: 'bold' }}>Enable SMS Notifications</label>
        </div>

        {settings.notifications.sms.enabled && (
          <div style={{ marginLeft: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.notifications.sms.fraudAlerts}
                onChange={(e) => handleNestedInputChange('notifications', 'sms', 'fraudAlerts', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label>Fraud Alerts</label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.notifications.sms.renewalReminders}
                onChange={(e) => handleNestedInputChange('notifications', 'sms', 'renewalReminders', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label>Renewal Reminders</label>
            </div>
          </div>
        )}

        <button
          onClick={() => handleTestNotification('SMS')}
          disabled={isLoading}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          Send Test SMS
        </button>
      </div>

      {/* Push Notifications */}
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#333' }}>🔔 Push Notifications</h4>
        
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={settings.notifications.push.enabled}
            onChange={(e) => handleNestedInputChange('notifications', 'push', 'enabled', e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          <label style={{ fontWeight: 'bold' }}>Enable Push Notifications</label>
        </div>

        {settings.notifications.push.enabled && (
          <div style={{ marginLeft: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.notifications.push.fraudAlerts}
                onChange={(e) => handleNestedInputChange('notifications', 'push', 'fraudAlerts', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label>Fraud Alerts</label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                checked={settings.notifications.push.renewalReminders}
                onChange={(e) => handleNestedInputChange('notifications', 'push', 'renewalReminders', e.target.checked)}
                style={{ marginRight: '0.5rem' }}
              />
              <label>Renewal Reminders</label>
            </div>
          </div>
        )}

        <button
          onClick={() => handleTestNotification('push')}
          disabled={isLoading}
          style={{
            background: '#28a745',
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          Send Test Push
        </button>
      </div>

      <button
        onClick={() => handleSave('Notification')}
        disabled={isLoading}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Saving...' : 'Save Notification Settings'}
      </button>
    </div>
  );

  const renderPreferencesTab = () => (
    <div style={{ maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Preferences</h3>
      
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
          Currency
        </label>
        <select
          value={settings.preferences.currency}
          onChange={(e) => handleInputChange('preferences', 'currency', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        >
          <option value="INR">Indian Rupee (₹)</option>
          <option value="USD">US Dollar ($)</option>
          <option value="EUR">Euro (€)</option>
          <option value="GBP">British Pound (£)</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
          Timezone
        </label>
        <select
          value={settings.preferences.timezone}
          onChange={(e) => handleInputChange('preferences', 'timezone', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        >
          <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
          <option value="America/New_York">America/New_York (EST)</option>
          <option value="Europe/London">Europe/London (GMT)</option>
          <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
          Language
        </label>
        <select
          value={settings.preferences.language}
          onChange={(e) => handleInputChange('preferences', 'language', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="ta">Tamil</option>
          <option value="te">Telugu</option>
          <option value="bn">Bengali</option>
        </select>
      </div>

      <button
        onClick={() => handleSave('Preferences')}
        disabled={isLoading}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );

  const renderSecurityTab = () => (
    <div style={{ maxWidth: '600px' }}>
      <h3 style={{ marginBottom: '1.5rem', color: '#333' }}>Security Settings</h3>
      
      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#333' }}>🔐 Two-Factor Authentication</h4>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={settings.security.twoFactorAuth}
            onChange={(e) => handleInputChange('security', 'twoFactorAuth', e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          <label style={{ fontWeight: 'bold' }}>Enable Two-Factor Authentication</label>
        </div>
        <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
          Add an extra layer of security to your account with 2FA.
        </p>
      </div>

      <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', color: '#333' }}>🔔 Login Notifications</h4>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            checked={settings.security.loginNotifications}
            onChange={(e) => handleInputChange('security', 'loginNotifications', e.target.checked)}
            style={{ marginRight: '0.5rem' }}
          />
          <label style={{ fontWeight: 'bold' }}>Notify on new logins</label>
        </div>
        <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
          Get notified when someone logs into your account from a new device.
        </p>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
          Session Timeout (minutes)
        </label>
        <select
          value={settings.security.sessionTimeout}
          onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={120}>2 hours</option>
          <option value={480}>8 hours</option>
        </select>
      </div>

      <button
        onClick={() => handleSave('Security')}
        disabled={isLoading}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '0.75rem 1.5rem',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '1rem',
          opacity: isLoading ? 0.7 : 1
        }}
      >
        {isLoading ? 'Saving...' : 'Save Security Settings'}
      </button>
    </div>
  );

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' }
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
            <h1 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Settings</h1>
            <p style={{ margin: 0, color: '#6c757d' }}>Manage your account settings and preferences</p>
          </div>

          {/* Message */}
          {message && (
            <div style={{
              background: message.includes('Error') ? '#f8d7da' : '#d4edda',
              color: message.includes('Error') ? '#721c24' : '#155724',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              border: `1px solid ${message.includes('Error') ? '#f5c6cb' : '#c3e6cb'}`
            }}>
              {message}
            </div>
          )}

          {/* Tabs */}
          <div style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              display: 'flex', 
              borderBottom: '1px solid #e9ecef',
              overflowX: 'auto'
            }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '1rem 1.5rem',
                    cursor: 'pointer',
                    borderBottom: activeTab === tab.id ? '2px solid #007bff' : '2px solid transparent',
                    color: activeTab === tab.id ? '#007bff' : '#6c757d',
                    fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div style={{ padding: '2rem' }}>
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'notifications' && renderNotificationsTab()}
              {activeTab === 'preferences' && renderPreferencesTab()}
              {activeTab === 'security' && renderSecurityTab()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
