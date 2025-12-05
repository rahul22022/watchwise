const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  deleteWatchlistItem,
  searchAndAddToWatchlist
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getWatchlist)
  .post(protect, addToWatchlist);

router.post('/search-add', protect, searchAndAddToWatchlist);

router.route('/:id')
  .put(protect, updateWatchlistItem)
  .delete(protect, deleteWatchlistItem);

module.exports = router;
