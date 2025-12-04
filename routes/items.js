const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../config/multer');

// Lost items listing
router.get('/lost', itemController.getLostItems);

// Found items listing
router.get('/found', itemController.getFoundItems);

// Claimed items listing
router.get('/claimed', itemController.getClaimedItems);

// Get item matches (API)
router.get('/:id/matches', itemController.getItemMatches);

// Item details
router.get('/:id', itemController.getItemDetails);

module.exports = router;
