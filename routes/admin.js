const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const claimController = require('../controllers/claimController');
const { isAdmin } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Login page
router.get('/login', adminController.getLoginPage);

// Handle login
router.post('/login', adminController.login);

// Logout
router.get('/logout', adminController.logout);

// Protected routes - require admin authentication
router.use(isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/', (req, res) => res.redirect('/admin/dashboard'));

// Items management
router.get('/items', adminController.getItems);
router.get('/items/pending', adminController.getPendingItems);
router.get('/items/:id/edit', adminController.getEditItem);
router.post('/items/:id', upload.single('image'), adminController.updateItem);
router.post('/items/:id/approve', adminController.approveItem);
router.post('/items/:id/reject', adminController.rejectItem);
router.post('/items/:id/claim', adminController.claimItem);
router.post('/items/:id/delete', adminController.deleteItem);

// Categories management
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.post('/categories/:id', adminController.updateCategory);
router.post('/categories/:id/delete', adminController.deleteCategory);

// Users management
router.get('/users', adminController.getUsers);
router.post('/users/:id/toggle', adminController.toggleUserStatus);

// Claim requests management
router.get('/claims', claimController.adminGetClaims);
router.get('/claims/:claimId', claimController.adminGetClaimDetail);
router.post('/claims/:claimId/status', claimController.adminUpdateClaimStatus);
router.post('/claims/:claimId/priority', claimController.adminSetPriority);

// Statistics
router.get('/statistics', adminController.getStatistics);

// Item Matching
router.get('/matching', adminController.getMatchingPage);
router.post('/matching/run', adminController.runMatching);

module.exports = router;
