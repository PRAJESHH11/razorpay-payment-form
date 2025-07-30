const express = require('express');
const router = express.Router();

// Import our authentication functions
const {
  register,
  login,
  googleAuth,
  getMe,
  logout,
  updateProfile
} = require('../controllers/authController');

// Import our authentication middleware
const { protect } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public (anyone can access)
router.post('/register', register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public (anyone can access)
router.post('/login', login);

// @route   POST /api/auth/google
// @desc    Google OAuth authentication
// @access  Public (anyone can access)
router.post('/google', googleAuth);

// @route   GET /api/auth/me
// @desc    Get current user info
// @access  Private (only logged-in users)
router.get('/me', protect, getMe);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private (only logged-in users)
router.post('/logout', protect, logout);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private (only logged-in users)
router.put('/profile', protect, updateProfile);

// Test route to make sure auth routes are working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;