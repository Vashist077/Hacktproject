const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Subscription = require('../models/Subscription');
const Alert = require('../models/Alert');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `subscriptions-${req.user.id}-${uniqueSuffix}.csv`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// @route   GET /api/subscriptions
// @desc    Get all subscriptions for user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, category, sortBy = 'name', sortOrder = 'asc' } = req.query;
    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (category) where.category = category;

    const sortable = new Set(['name', 'amount', 'nextBilling', 'status', 'createdAt']);
    const order = sortable.has(sortBy) ? [[sortBy, String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC']] : [['name', 'ASC']];

    const subscriptions = await Subscription.findAll({ where, order });

    res.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscriptions',
      error: error.message
    });
  }
});

// @route   GET /api/subscriptions/:id
// @desc    Get subscription by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription',
      error: error.message
    });
  }
});

// @route   POST /api/subscriptions
// @desc    Create new subscription
// @access  Private
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be less than 100 characters'),
  body('merchant').trim().isLength({ min: 1, max: 100 }).withMessage('Merchant is required and must be less than 100 characters'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('billingCycle').isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid billing cycle'),
  body('nextBilling').isISO8601().withMessage('Next billing date must be a valid date'),
  body('category').optional().isIn(['Streaming', 'Music', 'Software', 'Gaming', 'News', 'Productivity', 'Cloud Storage', 'VPN', 'Education', 'Fitness', 'Food', 'Transportation', 'Other']).withMessage('Invalid category')
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

    const subscriptionData = {
      ...req.body,
      userId: req.user.id
    };

    const subscription = await Subscription.create(subscriptionData);

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message
    });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription
// @access  Private
router.put('/:id', authenticateToken, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Name must be less than 100 characters'),
  body('merchant').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Merchant must be less than 100 characters'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('billingCycle').optional().isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).withMessage('Invalid billing cycle'),
  body('nextBilling').optional().isISO8601().withMessage('Next billing date must be a valid date')
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

    const subscription = await Subscription.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    await subscription.update(req.body);

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
});

// @route   DELETE /api/subscriptions/:id
// @desc    Delete subscription
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }
    await subscription.destroy();

    res.json({
      success: true,
      message: 'Subscription deleted successfully'
    });
  } catch (error) {
    console.error('Delete subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete subscription',
      error: error.message
    });
  }
});

// @route   POST /api/subscriptions/:id/pause
// @desc    Pause subscription
// @access  Private
router.post('/:id/pause', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    await subscription.pause();

    res.json({ success: true, message: 'Subscription paused successfully', data: subscription });
  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to pause subscription',
      error: error.message
    });
  }
});

// @route   POST /api/subscriptions/:id/cancel
// @desc    Cancel subscription
// @access  Private
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    await subscription.cancel();

    res.json({ success: true, message: 'Subscription cancelled successfully', data: subscription });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
});

// @route   POST /api/subscriptions/:id/reactivate
// @desc    Reactivate subscription
// @access  Private
router.post('/:id/reactivate', authenticateToken, async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    await subscription.reactivate();

    res.json({ success: true, message: 'Subscription reactivated successfully', data: subscription });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate subscription',
      error: error.message
    });
  }
});

// @route   POST /api/subscriptions/upload-csv
// @desc    Upload CSV file with subscriptions
// @access  Private
router.post('/upload-csv', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const results = [];
    const errors = [];

    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          const subscriptions = [];
          
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            
            try {
              // Map CSV columns to subscription fields
              const subscriptionData = {
                userId: req.user.id,
                name: row.name || row.subscription_name || row.service,
                merchant: row.merchant || row.company || row.name,
                amount: parseFloat(row.amount || row.price || row.cost),
                currency: row.currency || 'INR',
                billingCycle: row.billing_cycle || row.cycle || 'monthly',
                category: row.category || 'Other',
                nextBilling: new Date(row.next_billing || row.next_payment || row.due_date),
                description: row.description || '',
                source: 'csv_upload',
                confidence: 0.8
              };

              // Validate required fields
              if (!subscriptionData.name || !subscriptionData.merchant || !subscriptionData.amount) {
                errors.push(`Row ${i + 1}: Missing required fields (name, merchant, amount)`);
                continue;
              }

              const subscription = await Subscription.create(subscriptionData);
              subscriptions.push(subscription);
            } catch (error) {
              errors.push(`Row ${i + 1}: ${error.message}`);
            }
          }

          // Clean up uploaded file
          fs.unlinkSync(req.file.path);

          res.json({
            success: true,
            message: `Successfully imported ${subscriptions.length} subscriptions`,
            data: {
              imported: subscriptions.length,
              errors: errors.length,
              subscriptions,
              errorDetails: errors
            }
          });
        } catch (error) {
          console.error('CSV processing error:', error);
          res.status(500).json({
            success: false,
            message: 'Failed to process CSV file',
            error: error.message
          });
        }
      })
      .on('error', (error) => {
        console.error('CSV parsing error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to parse CSV file',
          error: error.message
        });
      });
  } catch (error) {
    console.error('Upload CSV error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload CSV file',
      error: error.message
    });
  }
});

// @route   GET /api/subscriptions/stats/summary
// @desc    Get subscription statistics summary
// @access  Private
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const stats = await Subscription.getSpendingSummary(req.user._id);
    
    // Get additional stats
    const activeCount = await Subscription.countDocuments({ user: req.user._id, status: 'active' });
    const pausedCount = await Subscription.countDocuments({ user: req.user._id, status: 'paused' });
    const cancelledCount = await Subscription.countDocuments({ user: req.user._id, status: 'cancelled' });
    
    // Get upcoming renewals
    const upcomingRenewals = await Subscription.findDueForRenewal(req.user._id, 7);
    
    // Get unused subscriptions
    const unusedSubscriptions = await Subscription.findUnused(req.user._id, 30);

    res.json({
      success: true,
      data: {
        spending: stats[0] || {
          totalMonthlySpending: 0,
          totalYearlySpending: 0,
          subscriptionCount: 0,
          averageAmount: 0
        },
        counts: {
          active: activeCount,
          paused: pausedCount,
          cancelled: cancelledCount,
          total: activeCount + pausedCount + cancelledCount
        },
        upcomingRenewals: upcomingRenewals.length,
        unusedSubscriptions: unusedSubscriptions.length
      }
    });
  } catch (error) {
    console.error('Get subscription stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription statistics',
      error: error.message
    });
  }
});

module.exports = router;
