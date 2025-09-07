const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'First name is required'
      },
      len: {
        args: [1, 50],
        msg: 'First name cannot exceed 50 characters'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Last name is required'
      },
      len: {
        args: [1, 50],
        msg: 'Last name cannot exceed 50 characters'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Please enter a valid email'
      },
      notEmpty: {
        msg: 'Email is required'
      }
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: {
        args: /^[\+]?[1-9][\d]{0,15}$/,
        msg: 'Please enter a valid phone number'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters long'
      },
      notEmpty: {
        msg: 'Password is required'
      }
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isEmailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailVerificationToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gmailConnected: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  gmailAccessToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gmailRefreshToken: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gmailExpiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emailFraudAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emailRenewalReminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emailSpendingAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  smsNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  smsFraudAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  smsRenewalReminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pushNotificationsEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  pushFraudAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  pushRenewalReminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  currency: {
    type: DataTypes.ENUM('INR', 'USD', 'EUR', 'GBP'),
    defaultValue: 'INR'
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'Asia/Kolkata'
  },
  language: {
    type: DataTypes.ENUM('en', 'hi', 'ta', 'te', 'bn'),
    defaultValue: 'en'
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save({ validate: false });
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Static methods
User.findByEmail = function(email) {
  return this.findOne({ 
    where: { 
      email: email.toLowerCase() 
    } 
  });
};

User.findActive = function() {
  return this.findAll({ 
    where: { 
      isActive: true 
    } 
  });
};

module.exports = User;
