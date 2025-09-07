const express = require('express');
const { body, validationResult } = require('express-validator');
const Alert = require('../models/Alert');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all alerts for user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, type, severity, sortBy = 'date', sortOrder = 'desc' } = req.query;
    
    let query = { user: req.user._id };
    
    // Apply filters
    if (status) {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (severity) {
      query.severity = severity;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const alerts = await Alert.find(query)
      .sort(sort)
      .populate('user', 'firstName lastName email')
      .populate('subscription', 'name merchant amount')
      .populate('resolvedBy', 'firstName lastName');

    res.json({
      success: true,
      data: {
        alerts,
        count: alerts.length
      }
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alerts',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/:id
// @desc    Get alert by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id
    })
      .populate('user', 'firstName lastName email')
      .populate('subscription', 'name merchant amount')
      .populate('resolvedBy', 'firstName lastName')
      .populate('actions.performedBy', 'firstName lastName');

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      data: {
        alert
      }
    });
  } catch (error) {
    console.error('Get alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alert',
      error: error.message
    });
  }
});

// @route   POST /api/alerts
// @desc    Create new alert
// @access  Private
router.post('/', authenticateToken, [
  body('type').isIn(['fraud', 'unused', 'price_increase', 'renewal', 'duplicate', 'unusual_spending', 'payment_failed', 'trial_ending', 'cancellation_risk', 'other']).withMessage('Invalid alert type'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('merchant').optional().trim().isLength({ max: 100 }).withMessage('Merchant name must be less than 100 characters'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level')
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

    const alertData = {
      ...req.body,
      user: req.user._id
    };

    const alert = new Alert(alertData);
    await alert.save();

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: {
        alert
      }
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert',
      error: error.message
    });
  }
});

// @route   PUT /api/alerts/:id
// @desc    Update alert
// @access  Private
router.put('/:id', authenticateToken, [
  body('title').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Title must be less than 200 characters'),
  body('description').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Description must be less than 1000 characters'),
  body('merchant').optional().trim().isLength({ max: 100 }).withMessage('Merchant name must be less than 100 characters'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level')
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

    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: {
        alert
      }
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/:id/resolve
// @desc    Resolve alert
// @access  Private
router.post('/:id/resolve', authenticateToken, [
  body('resolution').isIn(['confirmed_fraud', 'false_positive', 'user_action_required', 'resolved_automatically']).withMessage('Invalid resolution type'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
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

    const { resolution, notes } = req.body;

    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.resolve(resolution, req.user._id, notes);

    res.json({
      success: true,
      message: 'Alert resolved successfully',
      data: {
        alert
      }
    });
  } catch (error) {
    console.error('Resolve alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/:id/ignore
// @desc    Ignore alert
// @access  Private
router.post('/:id/ignore', authenticateToken, [
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
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

    const { notes } = req.body;

    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.ignore(req.user._id, notes);

    res.json({
      success: true,
      message: 'Alert ignored successfully',
      data: {
        alert
      }
    });
  } catch (error) {
    console.error('Ignore alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ignore alert',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/:id/investigate
// @desc    Start investigating alert
// @access  Private
router.post('/:id/investigate', authenticateToken, [
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
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

    const { notes } = req.body;

    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.startInvestigation(req.user._id, notes);

    res.json({
      success: true,
      message: 'Investigation started successfully',
      data: {
        alert
      }
    });
  } catch (error) {
    console.error('Start investigation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start investigation',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/:id/read
// @desc    Mark alert as read
// @access  Private
router.post('/:id/read', authenticateToken, async (req, res) => {
  try {
    const alert = await Alert.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    await alert.markAsRead();

    res.json({
      success: true,
      message: 'Alert marked as read',
      data: {
        alert
      }
    });
  } catch (error) {
    console.error('Mark alert as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark alert as read',
      error: error.message
    });
  }
});

// @route   POST /api/alerts/mark-all-read
// @desc    Mark all alerts as read
// @access  Private
router.post('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Alert.updateMany(
      { user: req.user._id, isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'All alerts marked as read'
    });
  } catch (error) {
    console.error('Mark all alerts as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all alerts as read',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/stats/summary
// @desc    Get alert statistics summary
// @access  Private
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const stats = await Alert.getAlertStats(req.user._id);
    
    // Get additional stats
    const fraudAlerts = await Alert.findFraudAlerts(req.user._id);
    const highPriorityAlerts = await Alert.findHighPriority(req.user._id);
    const unreadAlerts = await Alert.findUnread(req.user._id);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalAlerts: 0,
          activeAlerts: 0,
          resolvedAlerts: 0,
          fraudAlerts: 0,
          unreadAlerts: 0
        },
        fraudAlerts: fraudAlerts.length,
        highPriorityAlerts: highPriorityAlerts.length,
        unreadAlerts: unreadAlerts.length
      }
    });
  } catch (error) {
    console.error('Get alert stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get alert statistics',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/types/fraud
// @desc    Get fraud alerts
// @access  Private
router.get('/types/fraud', authenticateToken, async (req, res) => {
  try {
    const fraudAlerts = await Alert.findFraudAlerts(req.user._id)
      .populate('subscription', 'name merchant amount')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: {
        alerts: fraudAlerts,
        count: fraudAlerts.length
      }
    });
  } catch (error) {
    console.error('Get fraud alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fraud alerts',
      error: error.message
    });
  }
});

// @route   GET /api/alerts/types/unused
// @desc    Get unused subscription alerts
// @access  Private
router.get('/types/unused', authenticateToken, async (req, res) => {
  try {
    const unusedAlerts = await Alert.find({
      user: req.user._id,
      type: 'unused',
      status: 'active'
    })
      .populate('subscription', 'name merchant amount')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: {
        alerts: unusedAlerts,
        count: unusedAlerts.length
      }
    });
  } catch (error) {
    console.error('Get unused alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get unused alerts',
      error: error.message
    });
  }
});

module.exports = router;
