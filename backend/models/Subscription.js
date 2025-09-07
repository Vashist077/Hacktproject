const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Subscription = sequelize.define('Subscription', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Subscription name is required'
      },
      len: {
        args: [1, 100],
        msg: 'Subscription name cannot exceed 100 characters'
      }
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      len: {
        args: [0, 500],
        msg: 'Description cannot exceed 500 characters'
      }
    }
  },
  category: {
    type: DataTypes.ENUM(
      'Streaming', 'Music', 'Software', 'Gaming', 'News', 
      'Productivity', 'Cloud Storage', 'VPN', 'Education', 
      'Fitness', 'Food', 'Transportation', 'Other'
    ),
    allowNull: false,
    defaultValue: 'Other',
    validate: {
      notEmpty: {
        msg: 'Category is required'
      }
    }
  },
  merchant: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Merchant is required'
      },
      len: {
        args: [1, 100],
        msg: 'Merchant name cannot exceed 100 characters'
      }
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Amount cannot be negative'
      },
      notEmpty: {
        msg: 'Amount is required'
      }
    }
  },
  currency: {
    type: DataTypes.ENUM('INR', 'USD', 'EUR', 'GBP'),
    defaultValue: 'INR'
  },
  billingCycle: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
    allowNull: false,
    defaultValue: 'monthly',
    validate: {
      notEmpty: {
        msg: 'Billing cycle is required'
      }
    }
  },
  nextBilling: {
    type: DataTypes.DATE,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Next billing date is required'
      }
    }
  },
  lastBilling: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'cancelled', 'expired', 'trial'),
    defaultValue: 'active'
  },
  startDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  trialEndDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isTrial: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  autoRenew: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  paymentMethod: {
    type: DataTypes.ENUM('credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'other'),
    defaultValue: 'other'
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING(30)),
    defaultValue: []
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  usagePattern: {
    type: DataTypes.ENUM('high', 'medium', 'low', 'none'),
    defaultValue: 'medium'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Notes cannot exceed 1000 characters'
      }
    }
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  source: {
    type: DataTypes.ENUM('manual', 'csv_upload', 'gmail_import', 'ai_detection'),
    defaultValue: 'manual'
  },
  confidence: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 1.00,
    validate: {
      min: 0,
      max: 1
    }
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'subscriptions',
  timestamps: true,
  hooks: {
    beforeUpdate: (subscription) => {
      if (subscription.changed('lastUsed')) {
        const now = new Date();
        const daysSinceLastUsed = Math.floor((now - subscription.lastUsed) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastUsed <= 7) {
          subscription.usagePattern = 'high';
        } else if (daysSinceLastUsed <= 30) {
          subscription.usagePattern = 'medium';
        } else if (daysSinceLastUsed <= 90) {
          subscription.usagePattern = 'low';
        } else {
          subscription.usagePattern = 'none';
        }
      }
    }
  }
});

// Instance methods
Subscription.prototype.getFormattedAmount = function() {
  return `${this.currency} ${parseFloat(this.amount).toFixed(2)}`;
};

Subscription.prototype.getDaysUntilBilling = function() {
  if (!this.nextBilling) return null;
  const now = new Date();
  const diffTime = this.nextBilling - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

Subscription.prototype.getYearlyCost = function() {
  const cyclesPerYear = {
    daily: 365,
    weekly: 52,
    monthly: 12,
    quarterly: 4,
    yearly: 1
  };
  return parseFloat(this.amount) * cyclesPerYear[this.billingCycle];
};

Subscription.prototype.pause = async function() {
  this.status = 'paused';
  return await this.save();
};

Subscription.prototype.cancel = async function() {
  this.status = 'cancelled';
  this.endDate = new Date();
  return await this.save();
};

Subscription.prototype.reactivate = async function() {
  this.status = 'active';
  this.endDate = null;
  return await this.save();
};

Subscription.prototype.updateUsage = async function() {
  this.lastUsed = new Date();
  this.usageCount += 1;
  return await this.save();
};

// Static methods
Subscription.findActive = function(userId) {
  return this.findAll({ 
    where: { 
      userId: userId, 
      status: 'active' 
    } 
  });
};

Subscription.findDueForRenewal = function(userId, days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);
  
  return this.findAll({
    where: {
      userId: userId,
      status: 'active',
      nextBilling: {
        [sequelize.Sequelize.Op.lte]: futureDate
      }
    }
  });
};

Subscription.findUnused = function(userId, days = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  
  return this.findAll({
    where: {
      userId: userId,
      status: 'active',
      [sequelize.Sequelize.Op.or]: [
        { lastUsed: { [sequelize.Sequelize.Op.lt]: cutoffDate } },
        { lastUsed: null }
      ]
    }
  });
};

Subscription.getSpendingSummary = async function(userId) {
  const result = await this.findAll({
    where: { 
      userId: userId, 
      status: 'active' 
    },
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'subscriptionCount'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'totalMonthlySpending'],
      [sequelize.fn('AVG', sequelize.col('amount')), 'averageAmount']
    ],
    raw: true
  });

  if (result && result.length > 0) {
    const data = result[0];
    const subscriptions = await this.findAll({
      where: { 
        userId: userId, 
        status: 'active' 
      }
    });
    
    const totalYearlySpending = subscriptions.reduce((sum, sub) => {
      return sum + sub.getYearlyCost();
    }, 0);

    return {
      subscriptionCount: parseInt(data.subscriptionCount) || 0,
      totalMonthlySpending: parseFloat(data.totalMonthlySpending) || 0,
      totalYearlySpending: totalYearlySpending,
      averageAmount: parseFloat(data.averageAmount) || 0
    };
  }

  return {
    subscriptionCount: 0,
    totalMonthlySpending: 0,
    totalYearlySpending: 0,
    averageAmount: 0
  };
};

module.exports = Subscription;
