/**
 * ============================================================================
 * MAIN ROUTER (routes/index.js)
 * ============================================================================
 * 
 * PURPOSE:
 * This is the central routing hub that combines all route modules.
 * It acts as a "traffic director" that sends requests to the right handler.
 * 
 * WHAT IS ROUTING?
 * Routing determines how the application responds to different URLs.
 * When a user visits a URL, the router finds the matching route and
 * executes the associated controller function.
 * 
 * HOW IT WORKS:
 * 1. User visits URL (e.g., /items/lost)
 * 2. Express matches URL to route definition
 * 3. Route calls the controller function
 * 4. Controller processes request and sends response
 * 
 * ROUTE MOUNTING:
 * - router.use('/', homeRoutes)       → All routes from homeRoutes start with /
 * - router.use('/auth', authRoutes)   → All routes from authRoutes start with /auth
 * - router.use('/items', itemRoutes)  → All routes from itemRoutes start with /items
 * 
 * EXAMPLE:
 * If authRoutes has: router.get('/login', ...)
 * Mounting at '/auth' means the full URL is: /auth/login
 * 
 * ============================================================================
 */

// Import Express framework
const express = require('express');

// Create a new router instance
// Router is like a mini-application for handling routes
const router = express.Router();

/**
 * IMPORT ALL ROUTE MODULES
 * Each module handles a specific area of the application
 */

// Home routes: / (homepage, about, contact)
const homeRoutes = require('./home');

// Auth routes: /auth/* (login, register, logout, verify)
const authRoutes = require('./auth');

// Item routes: /items/* (view lost/found items, item details)
const itemRoutes = require('./items');

// Report routes: /report/* (report lost/found items)
const reportRoutes = require('./report');

// Search routes: /search/* (search functionality)
const searchRoutes = require('./search');

// Admin routes: /admin/* (admin dashboard, management)
const adminRoutes = require('./admin');

// User routes: /user/* (user dashboard, settings)
const userRoutes = require('./user');

// Claim routes: /claims/* (submit/view claims)
const claimRoutes = require('./claims');

/**
 * MOUNT ROUTES
 * 
 * Each use() call attaches a route module to a URL prefix.
 * The order matters - more specific routes should come first.
 */

// Mount home routes at root level (/, /about, /contact)
router.use('/', homeRoutes);

// Mount authentication routes (/auth/login, /auth/register, etc.)
router.use('/auth', authRoutes);

// Mount item viewing routes (/items/lost, /items/found, /items/:id)
router.use('/items', itemRoutes);

// Mount report submission routes (/report/lost, /report/found)
router.use('/report', reportRoutes);

// Mount search routes (/search)
router.use('/search', searchRoutes);

// Mount admin routes (/admin/dashboard, /admin/items, etc.)
router.use('/admin', adminRoutes);

// Mount user routes (/user/dashboard, /user/settings)
router.use('/user', userRoutes);

// Mount claim routes (/claims/submit, /claims/my-claims)
router.use('/claims', claimRoutes);

// Export the router for use in server.js
module.exports = router;
