const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Search items
router.get('/', itemController.searchItems);

module.exports = router;
