const express = require('express');
const router = express.Router();
const {
  fetchAndSaveContent,
  getPersonalizedRecommendations,
  getNetworkContent,
  getNetworkStats,
  searchNetworkContent
} = require('../controllers/networkController');
const { protect } = require('../middleware/auth');

// Fetch content from external APIs (protected for admin use)
router.post('/fetch', protect, fetchAndSaveContent);

// Get personalized recommendations based on user's subscriptions and interests
router.get('/recommendations', protect, getPersonalizedRecommendations);

// Get all network content with filters
router.get('/content', getNetworkContent);

// Search network content
router.get('/search', searchNetworkContent);

// Get statistics
router.get('/stats', getNetworkStats);

module.exports = router;
