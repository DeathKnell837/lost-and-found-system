const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
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

// Health check endpoint for monitoring
router.get('/health', async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const dbStates = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            database: {
                status: dbStates[dbState] || 'unknown',
                connected: dbState === 1
            },
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
            }
        };

        // If database is not connected, return 503
        if (dbState !== 1) {
            health.status = 'degraded';
            return res.status(503).json(health);
        }

        res.json(health);
    } catch (error) {
        res.status(500).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

module.exports = router;
