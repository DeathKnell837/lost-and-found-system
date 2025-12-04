const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/auth');
const { authRateLimit } = require('../middleware/security');

// Login page
router.get('/login', isGuest, authController.getLoginPage);

// Register page
router.get('/register', isGuest, authController.getRegisterPage);

// Handle registration (rate limited)
router.post('/register', isGuest, authRateLimit, authController.register);

// Handle login (rate limited)
router.post('/login', isGuest, authRateLimit, authController.login);

// Handle logout
router.get('/logout', authController.logout);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

// Resend verification email (rate limited)
router.get('/resend-verification', (req, res) => {
    res.render('auth/resend-verification', {
        title: 'Resend Verification - Lost & Found',
        email: req.query.email || ''
    });
});
router.post('/resend-verification', authRateLimit, authController.resendVerification);

// Profile page
router.get('/profile', isAuthenticated, authController.getProfile);

// Update profile
router.post('/profile', isAuthenticated, authController.updateProfile);

// Change password (rate limited)
router.post('/change-password', isAuthenticated, authRateLimit, authController.changePassword);

module.exports = router;
