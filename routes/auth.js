const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/auth');

// Login page
router.get('/login', isGuest, authController.getLoginPage);

// Register page
router.get('/register', isGuest, authController.getRegisterPage);

// Handle registration
router.post('/register', isGuest, authController.register);

// Handle login
router.post('/login', isGuest, authController.login);

// Handle logout
router.get('/logout', authController.logout);

// Profile page
router.get('/profile', isAuthenticated, authController.getProfile);

// Update profile
router.post('/profile', isAuthenticated, authController.updateProfile);

// Change password
router.post('/change-password', isAuthenticated, authController.changePassword);

module.exports = router;
