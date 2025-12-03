const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Home page
router.get('/', homeController.getHomePage);

// About page
router.get('/about', homeController.getAboutPage);

// Contact page
router.get('/contact', homeController.getContactPage);

module.exports = router;
