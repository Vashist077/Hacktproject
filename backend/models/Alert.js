const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Alert = sequelize.define('Alert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    validate: {
      notEmpty: {
        msg: 'User is required'
      }
    }
  },
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'subscriptions',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'fraud', 'unused', 'price_increase', 'renewal', 
      'duplicate', 'unusual_spending', 'payment_failed',
      'trial_ending', 'cancellation_risk', 'other'
    ),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Alert type is required'
      }
    }
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Alert title is required'
      },
      len: {
        args: [1, 200],
        msg: 'Title cannot exceed 200 characters'
      }
    }
  },
  description: {
    type: DataTypes.STRING(1000),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Alert description is required'
      },
      len: {
        args: [1, 1000],
        msg: 'Description cannot exceed 1000 characters'
      }
    }
  },
  merchant: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      len: {
        args: [0, 100],
        msg: 'Merchant name cannot exceed 100 characters'
      }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: {
        args: [0],
        msg: 'Amount cannot be negative'
      }
    }
  },
  currency: {
    type: DataTypes.ENUM('INR', 'USD', 'EUR', 'GBP'),
    defaultValue: 'INR'
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    validate: {
      notEmpty: {
        msg: 'Alert date is required'
      }
    }
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'resolved', 'ignored', 'investigating'),
    defaultValue: 'active'
  },
  resolution: {
    type: DataTypes.ENUM('confirmed_fraud', 'false_positive', 'user_action_required', 'resolved_automatically', 'ignored'),
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  actions: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  confidence: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.80,
    validate: {
      min: 0,
      max: 1
    }
  },
  source: {
    type: DataTypes.ENUM('ai_detection', 'manual', 'gmail_import', 'csv_upload', 'user_report'),
    defaultValue: 'ai_detection'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankReference: {
    type: DataTypes.STRING,
    allowNull: true
  },
  additionalData: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  smsSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pushSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastNotificationSent: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING(30)),
    defaultValue: []
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'alerts',
  timestamps: true,
  hooks: {
    beforeUpdate: (alert) => {
      if (alert.changed('status') && alert.status === 'resolved' && !alert.resolvedAt) {
        alert.resolvedAt = new Date();
      }
    }
  }
});

// Instance methods
Alert.prototype.getFormattedAmount = function() {
  if (!this.amount) return null;
  return `${this.currency} ${parseFloat(this.amount).toFixed(2)}`;
};

Alert.prototype.getAgeInDays = function() {
  const now = new Date();
  const diffTime = now - this.date;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

Alert.prototype.getIsUrgent = function() {
  const ageInDays = this.getAgeInDays();
  return this.severity === 'critical' || 
         (this.type === 'fraud' && this.severity === 'high') ||
         (ageInDays > 7 && this.status === 'active');
};

Alert.prototype.markAsRead = async function() {
  this.isRead = true;
  this.readAt = new Date();
  return await this.save();
};

Alert.prototype.resolve = async function(resolution, userId, notes = '') {
  this.status = 'resolved';
  this.resolution = resolution;
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  
  const actions = this.actions || [];
  actions.push({
    action: 'resolve',
    performedBy: userId,
    performedAt: new Date(),
    notes: notes
  });
  this.actions = actions;
  
  return await this.save();
};

Alert.prototype.ignore = async function(userId, notes = '') {
  this.status = 'ignored';
  this.resolution = 'ignored';
  this.resolvedAt = new Date();
  this.resolvedBy = userId;
  
  const actions = this.actions || [];
  actions.push({
    action: 'ignore',
    performedBy: userId,
    performedAt: new Date(),
    notes: notes
  });
  this.actions = actions;
  
  return await this.save();
};

Alert.prototype.startInvestigation = async function(userId, notes = '') {
  this.status = 'investigating';
  
  const actions = this.actions || [];
  actions.push({
    action: 'investigate',
    performedBy: userId,
    performedAt: new Date(),
    notes: notes
  });
  this.actions = actions;
  
  return await this.save();
};

Alert.prototype.addAction = async function(action, userId, notes = '') {
  const actions = this.actions || [];
  actions.push({
    action: action,
    performedBy: userId,
    performedAt: new Date(),
    notes: notes
  });
  this.actions = actions;
  
  return await this.save();
};

// Static methods
Alert.findActive = function(userId) {
  return this.findAll({ 
    where: { 
      userId: userId, 
      status: 'active' 
    } 
  });
};

Alert.findUnread = function(userId) {
  return this.findAll({ 
    where: { 
      userId: userId, 
      isRead: false 
    } 
  });
};

Alert.findFraudAlerts = function(userId) {
  return this.findAll({ 
    where: { 
      userId: userId, 
      type: 'fraud', 
      status: 'active' 
    } 
  });
};

Alert.findHighPriority = function(userId) {
  return this.findAll({ 
    where: { 
      userId: userId, 
      status: 'active',
      [sequelize.Sequelize.Op.or]: [
        { severity: 'critical' },
        { severity: 'high' },
        { type: 'fraud' }
      ]
    } 
  });
};

Alert.getAlertStats = async function(userId) {
  const result = await this.findAll({
    where: { userId: userId },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalAlerts'],
      [sequelize.literal("COUNT(CASE WHEN status = 'active' THEN 1 END)"), 'activeAlerts'],
      [sequelize.literal("COUNT(CASE WHEN status = 'resolved' THEN 1 END)"), 'resolvedAlerts'],
      [sequelize.literal("COUNT(CASE WHEN type = 'fraud' THEN 1 END)"), 'fraudAlerts'],
      [sequelize.literal("COUNT(CASE WHEN is_read = false THEN 1 END)"), 'unreadAlerts']
    ],
    raw: true
  });

  if (result && result.length > 0) {
    const data = result[0];
    return {
      totalAlerts: parseInt(data.totalAlerts) || 0,
      activeAlerts: parseInt(data.activeAlerts) || 0,
      resolvedAlerts: parseInt(data.resolvedAlerts) || 0,
      fraudAlerts: parseInt(data.fraudAlerts) || 0,
      unreadAlerts: parseInt(data.unreadAlerts) || 0
    };
  }

  return {
    totalAlerts: 0,
    activeAlerts: 0,
    resolvedAlerts: 0,
    fraudAlerts: 0,
    unreadAlerts: 0
  };
};

module.exports = Alert;
