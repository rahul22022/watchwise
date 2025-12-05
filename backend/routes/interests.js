const express = require('express');
const router = express.Router();
const {
  getInterests,
  createOrUpdateInterests,
  addFavoriteShow,
  addFavoriteMovie,
  deleteInterests,
} = require('../controllers/interestController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getInterests)
  .post(protect, createOrUpdateInterests)
  .delete(protect, deleteInterests);

router.post('/shows', protect, addFavoriteShow);
router.post('/movies', protect, addFavoriteMovie);

module.exports = router;
