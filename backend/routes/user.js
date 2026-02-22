// User Routes
const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getBalance, getUserProfile } = require('../controllers/userController');

// GET /api/user/balance - Get user balance (requires authentication)
router.get('/balance', verifyToken, getBalance);

// GET /api/user/profile - Get user profile (requires authentication)
router.get('/profile', verifyToken, getUserProfile);

module.exports = router;
