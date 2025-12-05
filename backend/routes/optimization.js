const express = require('express');
const router = express.Router();
const { getOptimizationRecommendations, getSubscriptionSchedule } = require('../controllers/optimizationController');
const { protect } = require('../middleware/auth');

// Get AI-powered optimization recommendations
router.get('/recommendations', protect, getOptimizationRecommendations);

// Get subscription timeline/schedule
router.get('/schedule', protect, getSubscriptionSchedule);

module.exports = router;
