const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, getMe, googleCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Check if Google OAuth is configured
const isGoogleOAuthConfigured = process.env.GOOGLE_CLIENT_ID && 
                                 process.env.GOOGLE_CLIENT_ID !== 'your_google_client_id_here' &&
                                 process.env.GOOGLE_CLIENT_SECRET;

// Google OAuth routes - only if configured
if (isGoogleOAuthConfigured) {
  router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    googleCallback
  );
} else {
  // Return helpful error message if OAuth not configured
  router.get('/google', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.'
    });
  });

  router.get('/google/callback', (req, res) => {
    res.status(503).json({
      success: false,
      message: 'Google OAuth is not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to your .env file.'
    });
  });
}

module.exports = router;
