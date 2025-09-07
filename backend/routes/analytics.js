const express = require('express');
const Subscription = require('../models/Subscription');
const Alert = require('../models/Alert');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/analytics/spending
// @desc    Get spending over time
// @access  Private
router.get('/spending', authenticateToken, async (req, res) => {
  try {
    const { range = '6months' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (range) {
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '1year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    }

    // Get spending data by month
    const spendingData = await Subscription.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'active',
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          totalSpending: { $sum: '$amount' },
          subscriptionCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Format data for charts
    const formattedData = spendingData.map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      spending: item.totalSpending,
      subscriptions: item.subscriptionCount
    }));

    res.json({
      success: true,
      data: {
        spending: formattedData,
        range: range
      }
    });
  } catch (error) {
    console.error('Get spending analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get spending analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/categories
// @desc    Get spending by category
// @access  Private
router.get('/categories', authenticateToken, async (req, res) => {
  try {
    const categoryData = await Subscription.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$category',
          totalSpending: { $sum: '$amount' },
          subscriptionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { totalSpending: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        categories: categoryData
      }
    });
  } catch (error) {
    console.error('Get category analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get category analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/fraud-detection
// @desc    Get fraud detection statistics
// @access  Private
router.get('/fraud-detection', authenticateToken, async (req, res) => {
  try {
    const fraudStats = await Alert.aggregate([
      {
        $match: {
          user: req.user._id,
          type: 'fraud'
        }
      },
      {
        $group: {
          _id: '$resolution',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate accuracy metrics
    const totalFraudAlerts = await Alert.countDocuments({
      user: req.user._id,
      type: 'fraud'
    });

    const confirmedFraud = await Alert.countDocuments({
      user: req.user._id,
      type: 'fraud',
      resolution: 'confirmed_fraud'
    });

    const falsePositives = await Alert.countDocuments({
      user: req.user._id,
      type: 'fraud',
      resolution: 'false_positive'
    });

    const accuracy = totalFraudAlerts > 0 ? (confirmedFraud / totalFraudAlerts) * 100 : 0;
    const falsePositiveRate = totalFraudAlerts > 0 ? (falsePositives / totalFraudAlerts) * 100 : 0;

    res.json({
      success: true,
      data: {
        stats: fraudStats,
        metrics: {
          totalAlerts: totalFraudAlerts,
          confirmedFraud: confirmedFraud,
          falsePositives: falsePositives,
          accuracy: Math.round(accuracy * 100) / 100,
          falsePositiveRate: Math.round(falsePositiveRate * 100) / 100
        }
      }
    });
  } catch (error) {
    console.error('Get fraud detection analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get fraud detection analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/forecast
// @desc    Get spending forecast
// @access  Private
router.get('/forecast', authenticateToken, async (req, res) => {
  try {
    // Get current spending data
    const currentSpending = await Subscription.getSpendingSummary(req.user._id);
    
    // Get spending trend over last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    
    const trendData = await Subscription.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'active',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          monthlySpending: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Calculate trend and forecast
    const monthlySpending = trendData.map(item => item.monthlySpending);
    const averageGrowth = monthlySpending.length > 1 ? 
      (monthlySpending[monthlySpending.length - 1] - monthlySpending[0]) / monthlySpending.length : 0;

    // Generate 6-month forecast
    const forecast = [];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    for (let i = 1; i <= 6; i++) {
      const forecastMonth = new Date(currentYear, currentMonth + i, 1);
      const baseSpending = currentSpending[0]?.totalMonthlySpending || 0;
      const forecastedSpending = baseSpending + (averageGrowth * i);
      
      forecast.push({
        month: `${forecastMonth.getFullYear()}-${(forecastMonth.getMonth() + 1).toString().padStart(2, '0')}`,
        predictedSpending: Math.max(0, forecastedSpending),
        potentialSavings: Math.max(0, forecastedSpending * 0.1) // Assume 10% savings potential
      });
    }

    res.json({
      success: true,
      data: {
        forecast: forecast,
        currentSpending: currentSpending[0] || {
          totalMonthlySpending: 0,
          totalYearlySpending: 0
        },
        trend: {
          averageGrowth: averageGrowth,
          direction: averageGrowth > 0 ? 'increasing' : averageGrowth < 0 ? 'decreasing' : 'stable'
        }
      }
    });
  } catch (error) {
    console.error('Get forecast analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get forecast analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/recommendations
// @desc    Get subscription recommendations
// @access  Private
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const recommendations = [];

    // Get unused subscriptions
    const unusedSubscriptions = await Subscription.findUnused(req.user._id, 30);
    if (unusedSubscriptions.length > 0) {
      recommendations.push({
        type: 'cancel_unused',
        title: 'Cancel Unused Subscriptions',
        description: `You have ${unusedSubscriptions.length} subscriptions with no usage in the last 30 days`,
        priority: 'high',
        potentialSavings: unusedSubscriptions.reduce((sum, sub) => sum + sub.amount, 0),
        subscriptions: unusedSubscriptions.map(sub => ({
          id: sub._id,
          name: sub.name,
          amount: sub.amount,
          lastUsed: sub.usage.lastUsed
        }))
      });
    }

    // Get duplicate subscriptions
    const duplicateSubscriptions = await Subscription.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$category',
          subscriptions: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicateSubscriptions.length > 0) {
      recommendations.push({
        type: 'consolidate_duplicates',
        title: 'Consolidate Duplicate Services',
        description: 'You have multiple subscriptions in the same category',
        priority: 'medium',
        potentialSavings: 0, // Calculate based on which ones to keep
        categories: duplicateSubscriptions.map(cat => ({
          category: cat._id,
          subscriptions: cat.subscriptions,
          count: cat.count
        }))
      });
    }

    // Get high-cost subscriptions
    const highCostSubscriptions = await Subscription.find({
      user: req.user._id,
      status: 'active',
      amount: { $gt: 1000 } // More than ₹1000
    }).sort({ amount: -1 });

    if (highCostSubscriptions.length > 0) {
      recommendations.push({
        type: 'review_high_cost',
        title: 'Review High-Cost Subscriptions',
        description: 'Consider alternatives for your most expensive subscriptions',
        priority: 'medium',
        potentialSavings: highCostSubscriptions.reduce((sum, sub) => sum + sub.amount * 0.2, 0), // 20% savings
        subscriptions: highCostSubscriptions.map(sub => ({
          id: sub._id,
          name: sub.name,
          amount: sub.amount,
          category: sub.category
        }))
      });
    }

    // Get trial subscriptions ending soon
    const trialEndingSoon = await Subscription.find({
      user: req.user._id,
      status: 'trial',
      trialEndDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } // Next 7 days
    });

    if (trialEndingSoon.length > 0) {
      recommendations.push({
        type: 'trial_ending',
        title: 'Trial Subscriptions Ending Soon',
        description: `${trialEndingSoon.length} trial subscriptions will end soon`,
        priority: 'high',
        potentialSavings: 0,
        subscriptions: trialEndingSoon.map(sub => ({
          id: sub._id,
          name: sub.name,
          amount: sub.amount,
          trialEndDate: sub.trialEndDate
        }))
      });
    }

    res.json({
      success: true,
      data: {
        recommendations: recommendations,
        totalPotentialSavings: recommendations.reduce((sum, rec) => sum + rec.potentialSavings, 0)
      }
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/top-merchants
// @desc    Get top merchants by spending
// @access  Private
router.get('/top-merchants', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const topMerchants = await Subscription.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$merchant',
          totalSpending: { $sum: '$amount' },
          subscriptionCount: { $sum: 1 },
          averageAmount: { $avg: '$amount' },
          categories: { $addToSet: '$category' }
        }
      },
      {
        $sort: { totalSpending: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: {
        merchants: topMerchants
      }
    });
  } catch (error) {
    console.error('Get top merchants error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get top merchants',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/insights
// @desc    Get key insights and summary
// @access  Private
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    // Get comprehensive analytics data
    const [spendingSummary, alertStats, unusedCount, upcomingRenewals] = await Promise.all([
      Subscription.getSpendingSummary(req.user._id),
      Alert.getAlertStats(req.user._id),
      Subscription.countDocuments({ user: req.user._id, status: 'active', 'usage.usagePattern': 'none' }),
      Subscription.countDocuments({ 
        user: req.user._id, 
        status: 'active',
        nextBilling: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const insights = {
      spending: {
        monthly: spendingSummary[0]?.totalMonthlySpending || 0,
        yearly: spendingSummary[0]?.totalYearlySpending || 0,
        average: spendingSummary[0]?.averageAmount || 0,
        count: spendingSummary[0]?.subscriptionCount || 0
      },
      alerts: {
        total: alertStats[0]?.totalAlerts || 0,
        active: alertStats[0]?.activeAlerts || 0,
        fraud: alertStats[0]?.fraudAlerts || 0,
        unread: alertStats[0]?.unreadAlerts || 0
      },
      optimization: {
        unusedSubscriptions: unusedCount,
        upcomingRenewals: upcomingRenewals,
        potentialSavings: (spendingSummary[0]?.totalMonthlySpending || 0) * 0.15 // 15% potential savings
      }
    };

    res.json({
      success: true,
      data: {
        insights: insights
      }
    });
  } catch (error) {
    console.error('Get insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get insights',
      error: error.message
    });
  }
});

module.exports = router;
