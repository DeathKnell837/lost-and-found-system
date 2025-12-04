const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

// Home page
router.get('/', homeController.getHomePage);

// About page
router.get('/about', homeController.getAboutPage);

// Contact page
router.get('/contact', homeController.getContactPage);

// Offline page (for PWA)
router.get('/offline', (req, res) => {
    res.render('offline', {
        title: 'Offline - Lost & Found'
    });
});

module.exports = router;
