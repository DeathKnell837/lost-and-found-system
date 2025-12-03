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

// Initialize Express app
const app = express();

// Trust proxy for Render.com (required for secure cookies behind proxy)
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Connect to MongoDB
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// EJS Layouts
app.use(expressLayouts);
app.set('layout', 'layouts/main');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

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

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('========================================');
    console.log('  Campus Lost & Found Management System');
    console.log('========================================');
    console.log(`  Server running on port ${PORT}`);
    console.log(`  URL: http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================');
    console.log('  Admin Panel: http://localhost:' + PORT + '/admin/login');
    console.log('========================================');
});

module.exports = app;
