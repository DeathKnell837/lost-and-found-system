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

// Forgot password
router.get('/forgot-password', isGuest, authController.getForgotPasswordPage);
router.post('/forgot-password', isGuest, authController.forgotPassword);

// Reset password
router.get('/reset-password/:token', isGuest, authController.getResetPasswordPage);
router.post('/reset-password/:token', isGuest, authController.resetPassword);

// Email verification
router.get('/verify-email/:token', authController.verifyEmail);

// Resend verification email (rate limited)
router.get('/resend-verification', (req, res) => {
    res.render('auth/resend-verification', {
        title: 'Resend Verification - Lost & Found',
        email: req.query.email || ''
    });
});
router.post('/resend-verification', authController.resendVerification);

// Profile page
router.get('/profile', isAuthenticated, authController.getProfile);

// Update profile
router.post('/profile', isAuthenticated, authController.updateProfile);

// Change password
router.post('/change-password', isAuthenticated, authController.changePassword);

module.exports = router;
