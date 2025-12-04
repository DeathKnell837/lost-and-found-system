const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(isAuthenticated);

// Dashboard
router.get('/dashboard', userController.getDashboard);

// My Items
router.get('/my-items', userController.getMyItems);

// Settings
router.get('/settings', userController.getSettings);
router.post('/settings', userController.updateSettings);
router.post('/settings/profile', userController.updateProfile);
router.post('/settings/password', userController.changePassword);

module.exports = router;
