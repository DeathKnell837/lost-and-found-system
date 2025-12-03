// Check if user is authenticated (regular users)
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('error', 'Please log in to access this page');
    res.redirect('/auth/login');
};

// Check if admin is authenticated (separate admin session)
const isAdmin = (req, res, next) => {
    if (req.session && req.session.admin) {
        return next();
    }
    req.flash('error', 'Access denied. Admin privileges required.');
    res.redirect('/admin/login');
};

// Check if user is guest (not logged in)
const isGuest = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return next();
    }
    res.redirect('/');
};

// Make user and admin available to all views (separate sessions)
const setLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.admin = req.session.admin || null;
    res.locals.isAdmin = !!req.session.admin;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next();
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isGuest,
    setLocals
};
