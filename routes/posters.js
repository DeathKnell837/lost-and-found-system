const express = require('express');
const router = express.Router();
const posterController = require('../controllers/posterController');

// QR code generation (JSON response)
router.get('/qr/:itemId', posterController.generateQRCode);

// Poster pages (HTML)
router.get('/poster/:itemId', posterController.getPoster);
router.get('/mini/:itemId', posterController.getMiniPoster);
router.get('/batch', posterController.getBatchPosters);

module.exports = router;
