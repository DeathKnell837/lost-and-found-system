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
    console.error(err.stack);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        req.flash('error', 'File size too large. Maximum size is 5MB.');
        return res.redirect('back');
    }

    if (err.message && err.message.includes('Only image files')) {
        req.flash('error', err.message);
        return res.redirect('back');
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        req.flash('error', `${field} already exists`);
        return res.redirect('back');
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        req.flash('error', messages.join(', '));
        return res.redirect('back');
    }

    // Default error
    res.status(500).render('error', {
        title: 'Error',
        message: 'Something went wrong!',
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
