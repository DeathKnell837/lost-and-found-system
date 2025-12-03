const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { upload } = require('../config/cloudinary');

// Report lost item form
router.get('/lost', itemController.getReportLostForm);

// Report found item form
router.get('/found', itemController.getReportFoundForm);

// Submit lost item report
router.post('/lost', upload.single('image'), itemController.reportLostItem);

// Submit found item report
router.post('/found', upload.single('image'), itemController.reportFoundItem);

module.exports = router;
