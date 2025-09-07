// API helper functions for SubGuard application

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: (email, password) => 
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData) => 
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () => 
    apiRequest('/auth/logout', {
      method: 'POST',
    }),

  forgotPassword: (email) => 
    apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, password) => 
    apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// User API
export const userAPI = {
  getProfile: () => apiRequest('/user/profile'),
  
  updateProfile: (userData) => 
    apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deleteAccount: () => 
    apiRequest('/user/account', {
      method: 'DELETE',
    }),
};

// Subscriptions API
export const subscriptionsAPI = {
  getAll: () => apiRequest('/subscriptions'),
  
  getById: (id) => apiRequest(`/subscriptions/${id}`),
  
  create: (subscriptionData) => 
    apiRequest('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscriptionData),
    }),

  update: (id, subscriptionData) => 
    apiRequest(`/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(subscriptionData),
    }),

  delete: (id) => 
    apiRequest(`/subscriptions/${id}`, {
      method: 'DELETE',
    }),

  pause: (id) => 
    apiRequest(`/subscriptions/${id}/pause`, {
      method: 'POST',
    }),

  cancel: (id) => 
    apiRequest(`/subscriptions/${id}/cancel`, {
      method: 'POST',
    }),

  uploadCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiRequest('/subscriptions/upload-csv', {
      method: 'POST',
      headers: {
        // Don't set Content-Type, let browser set it with boundary
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: formData,
    });
  },
};

// Alerts API
export const alertsAPI = {
  getAll: () => apiRequest('/alerts'),
  
  getById: (id) => apiRequest(`/alerts/${id}`),
  
  resolve: (id) => 
    apiRequest(`/alerts/${id}/resolve`, {
      method: 'POST',
    }),

  ignore: (id) => 
    apiRequest(`/alerts/${id}/ignore`, {
      method: 'POST',
    }),

  investigate: (id) => 
    apiRequest(`/alerts/${id}/investigate`, {
      method: 'POST',
    }),

  markAllAsRead: () => 
    apiRequest('/alerts/mark-all-read', {
      method: 'POST',
    }),
};

// Analytics API
export const analyticsAPI = {
  getSpendingOverTime: (timeRange = '6months') => 
    apiRequest(`/analytics/spending?range=${timeRange}`),
  
  getCategoryDistribution: () => apiRequest('/analytics/categories'),
  
  getFraudDetectionStats: () => apiRequest('/analytics/fraud-detection'),
  
  getForecast: () => apiRequest('/analytics/forecast'),
  
  getRecommendations: () => apiRequest('/analytics/recommendations'),
  
  getTopMerchants: () => apiRequest('/analytics/top-merchants'),
};

// Gmail Integration API
export const gmailAPI = {
  connect: () => apiRequest('/gmail/connect'),
  
  disconnect: () => 
    apiRequest('/gmail/disconnect', {
      method: 'POST',
    }),

  getStatus: () => apiRequest('/gmail/status'),
  
  syncTransactions: () => 
    apiRequest('/gmail/sync', {
      method: 'POST',
    }),
};

// Notifications API
export const notificationsAPI = {
  getSettings: () => apiRequest('/notifications/settings'),
  
  updateSettings: (settings) => 
    apiRequest('/notifications/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  testNotification: (type) => 
    apiRequest('/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ type }),
    }),
};

export default {
  auth: authAPI,
  user: userAPI,
  subscriptions: subscriptionsAPI,
  alerts: alertsAPI,
  analytics: analyticsAPI,
  gmail: gmailAPI,
  notifications: notificationsAPI,
};
