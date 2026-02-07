/**
 * ============================================================================
 * AUTHENTICATION MIDDLEWARE (auth.js)
 * ============================================================================
 * 
 * PURPOSE:
 * This file contains middleware functions that protect routes based on
 * authentication status. Middleware functions run BEFORE the route handler.
 * 
 * WHAT IS MIDDLEWARE?
 * Middleware is code that runs between receiving a request and sending a response.
 * It's like a security checkpoint:
 * 
 *   Request → [Middleware Check] → Route Handler → Response
 *                    ↓
 *            If check fails → Redirect to login
 * 
 * FUNCTIONS IN THIS FILE:
 * - isAuthenticated: Ensures user is logged in
 * - isAdmin: Ensures user has admin privileges
 * - isGuest: Ensures user is NOT logged in (for login/register pages)
 * - setLocals: Makes user data available to all views
 * 
 * ============================================================================
 */

/**
 * IS AUTHENTICATED MIDDLEWARE
 * 
 * Purpose: Check if a regular user is logged in
 * Usage: router.get('/protected-route', isAuthenticated, controller.function)
 * 
 * How it works:
 * - Checks if session contains user data
 * - If yes: allows request to continue (next())
 * - If no: redirects to login page
 * 
 * @param {Object} req - Express request object (contains session)
 * @param {Object} res - Express response object (used for redirect)
 * @param {Function} next - Function to call to proceed to next middleware/route
 */
const isAuthenticated = (req, res, next) => {
    // Check if session exists AND contains user data
    if (req.session && req.session.user) {
        return next();  // User is logged in, proceed to route
    }
    // Store the URL user was trying to access (for redirect after login)
    if (req.originalUrl && req.originalUrl !== '/auth/logout') {
        req.session.returnTo = req.originalUrl;
    }
    // User not logged in or session expired - show error and redirect
    req.flash('error', 'Your session has expired. Please log in again.');
    res.redirect('/auth/login');
};

/**
 * IS ADMIN MIDDLEWARE
 * 
 * Purpose: Check if user has admin privileges
 * Usage: router.get('/admin/dashboard', isAdmin, controller.function)
 * 
 * How it works:
 * - Checks if session contains admin data
 * - Admin session is separate from user session for extra security
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Callback to proceed
 */
const isAdmin = (req, res, next) => {
    // Check for admin session (separate from regular user session)
    if (req.session && req.session.admin) {
        return next();  // Admin is logged in, proceed
    }
    // Not an admin - deny access
    req.flash('error', 'Access denied. Admin privileges required.');
    res.redirect('/admin/login');
};

/**
 * IS GUEST MIDDLEWARE
 * 
 * Purpose: Check if user is NOT logged in
 * Usage: Used on login/register pages to prevent logged-in users from accessing
 * 
 * Why we need this:
 * - If user is already logged in, they shouldn't see the login page
 * - Redirect them to home page instead
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Callback to proceed
 */
const isGuest = (req, res, next) => {
    // If no session or no user, they are a guest
    if (!req.session || !req.session.user) {
        return next();  // Continue to login/register page
    }
    // User is already logged in - redirect to home
    res.redirect('/');
};

/**
 * SET LOCALS MIDDLEWARE
 * 
 * Purpose: Make user/admin data available to ALL views (EJS templates)
 * Usage: Applied globally to all routes in server.js
 * 
 * Why we need this:
 * - EJS templates need access to user data (username, role)
 * - Flash messages need to be passed to views
 * - res.locals makes data available in templates
 * 
 * What it sets:
 * - res.locals.user: Current logged in user (or null)
 * - res.locals.admin: Current logged in admin (or null)
 * - res.locals.isAdmin: Boolean for quick admin check in templates
 * - res.locals.success: Success flash messages
 * - res.locals.error: Error flash messages
 * - res.locals.info: Info flash messages
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Callback to proceed
 */
const setLocals = (req, res, next) => {
    // Make user data available to all views
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
    res.locals.isAdmin = !!req.session.admin;  // Convert to boolean
    
    // Make flash messages available to all views
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    
    next();  // Continue to next middleware/route
};

// Export all middleware functions for use in other files
module.exports = {
    isAuthenticated,
    isAdmin,
    isGuest,
    setLocals
};
