require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

// Import database connection
const connectDB = require('./config/database');

// Import routes
const routes = require('./routes');

// Import middleware
const { setLocals } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');
const { 
    securityHeaders, 
    sanitizeInput,
    preventNoSQLInjection,
    slowRequestLogger
} = require('./middleware/security');

// Initialize Express app
const app = express();

// Trust proxy for Render.com (required for secure cookies behind proxy)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Connect to MongoDB (non-blocking)
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// EJS Layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Security Middleware (apply early)
app.use(securityHeaders);
app.use(slowRequestLogger(5000)); // Log requests taking more than 5 seconds

// Body parsing middleware with size limits
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(methodOverride('_method'));

// Input sanitization (after body parsing)
app.use(sanitizeInput);
app.use(preventNoSQLInjection);

// Request timeout
app.use((req, res, next) => {
    req.setTimeout(30000); // 30 seconds timeout
    res.setTimeout(30000);
    next();
});

// Static files with cache control
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag: true
}));

// Favicon handler (prevent 500 errors)
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content - browser will use default
});

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'lost-and-found-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions',
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Flash messages
app.use(flash());

// Set local variables (user, flash messages)
app.use(setLocals);

// Custom locals for all views
app.use((req, res, next) => {
    res.locals.currentYear = new Date().getFullYear();
    res.locals.appName = 'Campus Lost & Found';
    next();
});

// Use routes
app.use('/', routes);

// 404 Handler
app.use((req, res, next) => {
    const error = new Error('Page Not Found');
    error.status = 404;
    next(error);
});

// Error Handler
app.use(errorHandler);

// Start server - bind to 0.0.0.0 for Render
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log('========================================');
    console.log('  Campus Lost & Found Management System');
    console.log('========================================');
    console.log(`  Server running on ${HOST}:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
});

module.exports = app;
