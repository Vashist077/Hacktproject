const express = require('express');

const authRoutes = require('./auth');
const userRoutes = require('./user');
const subscriptionRoutes = require('./subscriptions');
const alertRoutes = require('./alerts');
const analyticsRoutes = require('./analytics');
const gmailRoutes = require('./gmail');
const notificationRoutes = require('./notifications');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/alerts', alertRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/gmail', gmailRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;


