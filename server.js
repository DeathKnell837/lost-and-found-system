/**
 * ============================================================
 * CAMPUS LOST & FOUND MANAGEMENT SYSTEM
 * ============================================================
 * 
 * Main Entry Point (server.js)
 * 
 * This is the main file that starts the entire application.
 * It sets up the Express server, connects to the database,
 * configures middleware, and starts listening for requests.
 * 
 * WHAT THIS FILE DOES:
 * 1. Loads environment variables (.env file)
 * 2. Connects to MongoDB database
 * 3. Sets up the view engine (EJS templates)
 * 4. Configures security middleware
 * 5. Sets up user sessions (login persistence)
 * 6. Connects all the routes (URLs)
 * 7. Starts the server
 * 
 * TECHNOLOGY USED:
 * - Express.js: Web framework for Node.js
 * - MongoDB: NoSQL database for storing data
 * - EJS: Template engine for rendering HTML pages
 * - Session: For keeping users logged in
 * 
 * ============================================================
 */

// Load environment variables from .env file
// This contains sensitive data like database passwords
require('dotenv').config();

// Import required packages (npm modules)
const express = require('express');           // Web framework
const path = require('path');                 // For file paths
const session = require('express-session');   // User session management
const MongoStore = require('connect-mongo');  // Store sessions in MongoDB
const flash = require('connect-flash');       // Flash messages (success/error alerts)
const methodOverride = require('method-override'); // Allow PUT/DELETE in forms
const expressLayouts = require('express-ejs-layouts'); // Layout templates

// Import our custom modules
const connectDB = require('./config/database');  // Database connection
const routes = require('./routes');              // All URL routes
const { setLocals } = require('./middleware/auth');  // Authentication middleware
const { errorHandler } = require('./middleware/errorHandler');  // Error handling
const { 
    securityHeaders, 
    sanitizeInput,
    preventNoSQLInjection,
    slowRequestLogger
} = require('./middleware/security');  // Security middleware

// ============================================================
// CREATE EXPRESS APPLICATION
// ============================================================
const app = express();

// Trust proxy for Render.com deployment
// Required for secure cookies when behind a proxy/load balancer
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// ============================================================
// DATABASE CONNECTION
// ============================================================
// Connect to MongoDB Atlas (cloud database)
// This is non-blocking so the server can start even if DB is slow
connectDB();

// ============================================================
// VIEW ENGINE SETUP
// ============================================================
// EJS (Embedded JavaScript) is used to render HTML pages
// Views are stored in the /views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// EJS Layouts - allows us to have a main layout template
// that wraps all pages (header, footer, navbar)
app.use(expressLayouts);
app.set('layout', 'layouts/main');  // Default layout file
app.set('layout extractScripts', true);  // Extract scripts to end of body
app.set('layout extractStyles', true);   // Extract styles to head

// ============================================================
// SECURITY MIDDLEWARE
// ============================================================
// These protect the application from common attacks
app.use(securityHeaders);  // Set secure HTTP headers
app.use(slowRequestLogger(5000));  // Log slow requests (>5 seconds)

// ============================================================
// BODY PARSING MIDDLEWARE
// ============================================================
// These allow us to read data from form submissions and JSON
app.use(express.json({ limit: '5mb' }));  // Parse JSON data
app.use(express.urlencoded({ extended: true, limit: '5mb' }));  // Parse form data
app.use(methodOverride('_method'));  // Allow PUT/DELETE from HTML forms

// Input sanitization - clean user input to prevent attacks
app.use(sanitizeInput);  // Remove dangerous characters
app.use(preventNoSQLInjection);  // Prevent database injection attacks

// Request timeout - prevent hanging requests
app.use((req, res, next) => {
    req.setTimeout(30000);  // 30 seconds max
    res.setTimeout(30000);
    next();
});

// ============================================================
// STATIC FILES
// ============================================================
// Serve files from /public folder (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,  // Cache for 1 day in production
    etag: true  // Enable ETag for caching
}));

// Handle favicon request (browser icon)
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();  // No content
});

// ============================================================
// SESSION CONFIGURATION
// ============================================================
// Sessions keep users logged in across page requests
// Session data is stored in MongoDB (persists across server restarts)
app.use(session({
    secret: process.env.SESSION_SECRET || 'lost-and-found-secret-key',  // Encryption key
    resave: false,  // Don't save session if nothing changed
    saveUninitialized: false,  // Don't create session until something stored
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,  // Store sessions in MongoDB
        collectionName: 'sessions',
        ttl: 24 * 60 * 60  // Session expires after 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
        httpOnly: true,  // Prevent JavaScript access to cookie
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000  // Cookie expires after 1 day
    }
}));

// ============================================================
// FLASH MESSAGES
// ============================================================
// Flash messages show success/error alerts after redirects
app.use(flash());

// Make user and flash messages available in all views
app.use(setLocals);

// Add custom variables available in all views
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    res.locals.appName = 'Campus Lost & Found';
    next();
});

// ============================================================
// ROUTES
// ============================================================
// Connect all URL routes (defined in /routes folder)
app.use('/', routes);

// ============================================================
// ERROR HANDLING
// ============================================================
// 404 Handler - Page not found
app.use((req, res, next) => {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
});

// Global error handler - catches all errors
app.use(errorHandler);

// ============================================================
// START SERVER
// ============================================================
const PORT = process.env.PORT || 3000;  // Port to listen on
const HOST = '0.0.0.0';  // Listen on all network interfaces

app.listen(PORT, HOST, () => {
    console.log('========================================');
    console.log('  Campus Lost & Found Management System');
    console.log('========================================');
    console.log(`  Server running on ${HOST}:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
});

// Export app for testing
module.exports = app;
