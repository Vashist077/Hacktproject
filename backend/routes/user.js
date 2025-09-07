const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, requireEmailVerification } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticateToken, [
  body('firstName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('First name must be less than 50 characters'),
  body('lastName').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Last name must be less than 50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('preferences.currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('preferences.timezone').optional().isString().withMessage('Invalid timezone'),
  body('preferences.language').optional().isIn(['en', 'hi', 'ta', 'te', 'bn']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const allowedUpdates = ['firstName', 'lastName', 'phone', 'preferences'];
    const updates = {};

    // Only allow specific fields to be updated
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// @route   PUT /api/user/notification-settings
// @desc    Update notification settings
// @access  Private
router.put('/notification-settings', authenticateToken, [
  body('email.enabled').optional().isBoolean().withMessage('Email enabled must be boolean'),
  body('email.fraudAlerts').optional().isBoolean().withMessage('Email fraud alerts must be boolean'),
  body('email.renewalReminders').optional().isBoolean().withMessage('Email renewal reminders must be boolean'),
  body('email.spendingAlerts').optional().isBoolean().withMessage('Email spending alerts must be boolean'),
  body('sms.enabled').optional().isBoolean().withMessage('SMS enabled must be boolean'),
  body('sms.fraudAlerts').optional().isBoolean().withMessage('SMS fraud alerts must be boolean'),
  body('sms.renewalReminders').optional().isBoolean().withMessage('SMS renewal reminders must be boolean'),
  body('push.enabled').optional().isBoolean().withMessage('Push enabled must be boolean'),
  body('push.fraudAlerts').optional().isBoolean().withMessage('Push fraud alerts must be boolean'),
  body('push.renewalReminders').optional().isBoolean().withMessage('Push renewal reminders must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { notificationSettings: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Notification settings updated successfully',
      data: {
        user: {
          notificationSettings: user.notificationSettings
        }
      }
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification settings',
      error: error.message
    });
  }
});

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', authenticateToken, [
  body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP']).withMessage('Invalid currency'),
  body('timezone').optional().isString().withMessage('Invalid timezone'),
  body('language').optional().isIn(['en', 'hi', 'ta', 'te', 'bn']).withMessage('Invalid language')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences: req.body },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        user: {
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
});

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    // Soft delete - mark as inactive instead of actually deleting
    await User.findByIdAndUpdate(req.user._id, { isActive: false });

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
      error: error.message
    });
  }
});

// @route   GET /api/user/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const Subscription = require('../models/Subscription');
    const Alert = require('../models/Alert');

    // Get subscription stats
    const subscriptionStats = await Subscription.getSpendingSummary(req.user._id);
    
    // Get alert stats
    const alertStats = await Alert.getAlertStats(req.user._id);

    const stats = {
      subscriptions: subscriptionStats[0] || {
        totalMonthlySpending: 0,
        totalYearlySpending: 0,
        subscriptionCount: 0,
        averageAmount: 0
      },
      alerts: alertStats[0] || {
        totalAlerts: 0,
        activeAlerts: 0,
        resolvedAlerts: 0,
        fraudAlerts: 0,
        unreadAlerts: 0
      }
    };

    res.json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user statistics',
      error: error.message
    });
  }
});

module.exports = router;
