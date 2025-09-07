const express = require('express');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Alert = require('../models/Alert');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Twilio client setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// @route   GET /api/notifications/settings
// @desc    Get notification settings
// @access  Private
router.get('/settings', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        settings: user.notificationSettings
      }
    });
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notification settings',
      error: error.message
    });
  }
});

// @route   PUT /api/notifications/settings
// @desc    Update notification settings
// @access  Private
router.put('/settings', authenticateToken, [
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
        settings: user.notificationSettings
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

// @route   POST /api/notifications/test
// @desc    Send test notification
// @access  Private
router.post('/test', authenticateToken, [
  body('type').isIn(['email', 'sms', 'push']).withMessage('Invalid notification type')
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

    const { type } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let result;

    switch (type) {
      case 'email':
        result = await sendTestEmail(user);
        break;
      case 'sms':
        result = await sendTestSMS(user);
        break;
      case 'push':
        result = await sendTestPush(user);
        break;
    }

    res.json({
      success: true,
      message: `Test ${type} notification sent successfully`,
      data: result
    });
  } catch (error) {
    console.error('Send test notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test notification',
      error: error.message
    });
  }
});

// @route   POST /api/notifications/send
// @desc    Send notification (internal use)
// @access  Private
router.post('/send', authenticateToken, [
  body('type').isIn(['fraud_alert', 'renewal_reminder', 'spending_alert', 'trial_ending']).withMessage('Invalid notification type'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required'),
  body('alertId').optional().isMongoId().withMessage('Invalid alert ID')
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

    const { type, title, message, alertId } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const results = [];

    // Send email if enabled
    if (user.notificationSettings.email.enabled && 
        user.notificationSettings.email[getEmailSettingKey(type)]) {
      try {
        const emailResult = await sendEmail(user, title, message, type);
        results.push({ type: 'email', success: true, result: emailResult });
      } catch (error) {
        results.push({ type: 'email', success: false, error: error.message });
      }
    }

    // Send SMS if enabled
    if (user.notificationSettings.sms.enabled && 
        user.notificationSettings.sms[getSMSSettingKey(type)] && 
        user.phone) {
      try {
        const smsResult = await sendSMS(user, message);
        results.push({ type: 'sms', success: true, result: smsResult });
      } catch (error) {
        results.push({ type: 'sms', success: false, error: error.message });
      }
    }

    // Send push notification if enabled
    if (user.notificationSettings.push.enabled && 
        user.notificationSettings.push[getPushSettingKey(type)]) {
      try {
        const pushResult = await sendPushNotification(user, title, message);
        results.push({ type: 'push', success: true, result: pushResult });
      } catch (error) {
        results.push({ type: 'push', success: false, error: error.message });
      }
    }

    // Update alert notification status if alertId provided
    if (alertId) {
      await Alert.findByIdAndUpdate(alertId, {
        'notifications.emailSent': results.some(r => r.type === 'email' && r.success),
        'notifications.smsSent': results.some(r => r.type === 'sms' && r.success),
        'notifications.pushSent': results.some(r => r.type === 'push' && r.success),
        'notifications.lastNotificationSent': new Date()
      });
    }

    res.json({
      success: true,
      message: 'Notifications sent',
      data: {
        results: results
      }
    });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notifications',
      error: error.message
    });
  }
});

// Helper functions for sending notifications

async function sendTestEmail(user) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'SubGuard - Test Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">SubGuard Test Email</h2>
        <p>Hello ${user.firstName},</p>
        <p>This is a test email to verify your notification settings are working correctly.</p>
        <p>If you received this email, your email notifications are properly configured.</p>
        <hr style="border: 1px solid #e9ecef; margin: 20px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          This is an automated message from SubGuard. Please do not reply to this email.
        </p>
      </div>
    `
  };

  const result = await emailTransporter.sendMail(mailOptions);
  return { messageId: result.messageId };
}

async function sendTestSMS(user) {
  if (!user.phone) {
    throw new Error('Phone number not provided');
  }

  const message = await twilioClient.messages.create({
    body: 'SubGuard Test SMS: Your SMS notifications are working correctly!',
    from: process.env.TWILIO_PHONE_NUMBER,
    to: user.phone
  });

  return { sid: message.sid };
}

async function sendTestPush(user) {
  // In a real app, you'd integrate with FCM or similar push notification service
  // For now, we'll just return a mock response
  return { 
    success: true, 
    message: 'Push notification would be sent here' 
  };
}

async function sendEmail(user, title, message, type) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: user.email,
    subject: `SubGuard - ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #007bff;">SubGuard Alert</h2>
        <h3 style="color: #333;">${title}</h3>
        <p>Hello ${user.firstName},</p>
        <p>${message}</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0; color: #6c757d;">
            <strong>Alert Type:</strong> ${type.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        <p>
          <a href="${process.env.FRONTEND_URL}/dashboard" 
             style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Dashboard
          </a>
        </p>
        <hr style="border: 1px solid #e9ecef; margin: 20px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          This is an automated message from SubGuard. Please do not reply to this email.
        </p>
      </div>
    `
  };

  const result = await emailTransporter.sendMail(mailOptions);
  return { messageId: result.messageId };
}

async function sendSMS(user, message) {
  if (!user.phone) {
    throw new Error('Phone number not provided');
  }

  const smsMessage = await twilioClient.messages.create({
    body: `SubGuard Alert: ${message}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: user.phone
  });

  return { sid: smsMessage.sid };
}

async function sendPushNotification(user, title, message) {
  // In a real app, you'd integrate with FCM or similar
  // For now, we'll just return a mock response
  return { 
    success: true, 
    message: 'Push notification sent' 
  };
}

// Helper functions to get setting keys based on notification type
function getEmailSettingKey(type) {
  switch (type) {
    case 'fraud_alert': return 'fraudAlerts';
    case 'renewal_reminder': return 'renewalReminders';
    case 'spending_alert': return 'spendingAlerts';
    default: return 'fraudAlerts';
  }
}

function getSMSSettingKey(type) {
  switch (type) {
    case 'fraud_alert': return 'fraudAlerts';
    case 'renewal_reminder': return 'renewalReminders';
    default: return 'fraudAlerts';
  }
}

function getPushSettingKey(type) {
  switch (type) {
    case 'fraud_alert': return 'fraudAlerts';
    case 'renewal_reminder': return 'renewalReminders';
    default: return 'fraudAlerts';
  }
}

module.exports = router;
