const { sequelize, testConnection } = require('../config/database');
const User = require('./User');
const Subscription = require('./Subscription');
const Alert = require('./Alert');

// Define associations
User.hasMany(Subscription, {
  foreignKey: 'userId',
  as: 'subscriptions',
  onDelete: 'CASCADE'
});

Subscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

User.hasMany(Alert, {
  foreignKey: 'userId',
  as: 'alerts',
  onDelete: 'CASCADE'
});

Alert.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Subscription.hasMany(Alert, {
  foreignKey: 'subscriptionId',
  as: 'alerts',
  onDelete: 'SET NULL'
});

Alert.belongsTo(Subscription, {
  foreignKey: 'subscriptionId',
  as: 'subscription'
});

// Sync database
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Subscription,
  Alert,
  syncDatabase,
  testConnection
};
