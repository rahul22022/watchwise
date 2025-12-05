const express = require('express');
const router = express.Router();
const {
  getSubscriptions,
  getSubscription,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getSubscriptions)
  .post(protect, createSubscription);

router.route('/:id')
  .get(protect, getSubscription)
  .put(protect, updateSubscription)
  .delete(protect, deleteSubscription);

module.exports = router;
