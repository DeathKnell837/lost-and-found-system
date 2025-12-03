const express = require('express');
const router = express.Router();

const homeRoutes = require('./home');
const authRoutes = require('./auth');
const itemRoutes = require('./items');
const reportRoutes = require('./report');
const searchRoutes = require('./search');
const adminRoutes = require('./admin');

// Mount routes
router.use('/', homeRoutes);
router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/report', reportRoutes);
router.use('/search', searchRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
