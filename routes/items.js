const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const upload = require('../config/multer');
const { validateObjectIdParams } = require('../middleware/security');

// Lost items listing
router.get('/lost', itemController.getLostItems);

// Found items listing
router.get('/found', itemController.getFoundItems);

// Claimed items listing
router.get('/claimed', itemController.getClaimedItems);

// Get item matches (API) - with ObjectId validation
router.get('/:id/matches', validateObjectIdParams('id'), itemController.getItemMatches);

// Item details - with ObjectId validation
router.get('/:id', validateObjectIdParams('id'), itemController.getItemDetails);

module.exports = router;
