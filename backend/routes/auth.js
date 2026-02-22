// Authentication Routes
const express = require('express');
const router = express.Router();
const { register, login, logout } = require('../controllers/authController');

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/logout - Logout user
router.post('/logout', logout);

module.exports = router;
