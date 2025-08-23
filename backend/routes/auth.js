const express = require('express');
const router = express.Router();
const { validateUser, validateLogin } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { register, login, getProfile, updatePassword } = require('../controllers/authController');

// Public routes
router.post('/register', validateUser, register);
router.post('/login', validateLogin, login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);
router.put('/password', authenticateToken, updatePassword);

module.exports = router;
