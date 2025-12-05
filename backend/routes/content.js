const express = require('express');
const router = express.Router();
const {
  getContent,
  getContentByGenre,
  searchAndRecommend,
  addContent,
  aiSearch,
  getContentByPlatform,
  getTitlesByPlatform
} = require('../controllers/contentController');
const { protect } = require('../middleware/auth');

router.get('/', getContent);
router.get('/by-genre', protect, getContentByGenre);
router.get('/by-platform', getContentByPlatform);
router.get('/platform/:platformName', getTitlesByPlatform);
router.get('/search/:title', protect, searchAndRecommend);
router.post('/ai-search', protect, aiSearch);
router.post('/', protect, addContent);

module.exports = router;
