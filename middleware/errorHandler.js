const { validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(err => err.msg);
        req.flash('error', errorMessages.join(', '));
        return res.redirect('back');
    }
    next();
};

// Custom error handler
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    if (process.env.NODE_ENV === 'development') {
        console.error(err.stack);
    }

    // Check if it's an API/JSON request
    const isApiRequest = req.xhr || 
        req.headers.accept?.includes('application/json') ||
        req.path.startsWith('/api/') ||
        req.path.startsWith('/comments/') ||
        req.path.startsWith('/claims/');

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        if (isApiRequest) {
            return res.status(400).json({ success: false, message: 'File size too large. Maximum size is 5MB.' });
        }
        req.flash('error', 'File size too large. Maximum size is 5MB.');
        return res.redirect('back');
    }

    if (err.message && err.message.includes('Only image files')) {
        if (isApiRequest) {
            return res.status(400).json({ success: false, message: err.message });
        }
        req.flash('error', err.message);
        return res.redirect('back');
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        if (isApiRequest) {
            return res.status(400).json({ success: false, message: `${field} already exists` });
        }
        req.flash('error', `${field} already exists`);
        return res.redirect('back');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        if (isApiRequest) {
            return res.status(400).json({ success: false, message: messages.join(', ') });
        }
        req.flash('error', messages.join(', '));
        return res.redirect('back');
    }

    // MongoDB CastError (invalid ObjectId)
    if (err.name === 'CastError') {
        if (isApiRequest) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }
        req.flash('error', 'Invalid request');
        return res.redirect('/');
    }

    // For API requests, return JSON error
    if (isApiRequest) {
        return res.status(err.status || 500).json({ 
            success: false, 
            message: err.message || 'Something went wrong'
        });
    }

    // Default error
    res.status(err.status || 500).render('error', {
        title: 'Error',
        message: err.status === 404 ? 'Page not found' : 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).render('error', {
        title: '404 - Not Found',
        message: 'The page you are looking for does not exist.',
        error: {}
    });
};

module.exports = {
    handleValidationErrors,
    errorHandler,
    notFoundHandler
};
