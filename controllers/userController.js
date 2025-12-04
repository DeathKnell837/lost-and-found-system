const { User, Item } = require('../models');

// Get user dashboard
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.session.user._id;

        // Get user's items
        const myItems = await Item.find({ reportedBy: userId })
            .populate('category')
            .sort({ dateReported: -1 })
            .limit(5);

        // Get stats
        const stats = {
            totalReported: await Item.countDocuments({ reportedBy: userId }),
            pending: await Item.countDocuments({ reportedBy: userId, status: 'pending' }),
            approved: await Item.countDocuments({ reportedBy: userId, status: 'approved' }),
            claimed: await Item.countDocuments({ reportedBy: userId, status: 'claimed' }),
            rejected: await Item.countDocuments({ reportedBy: userId, status: 'rejected' }),
            lostItems: await Item.countDocuments({ reportedBy: userId, type: 'lost' }),
            foundItems: await Item.countDocuments({ reportedBy: userId, type: 'found' })
        };

        res.render('user/dashboard', {
            title: 'My Dashboard - Lost & Found',
            stats,
            myItems,
            user: req.session.user
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        req.flash('error', 'Error loading dashboard');
        res.redirect('/');
    }
};

// Get my items
exports.getMyItems = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;

        let query = { reportedBy: userId };

        // Filter by status
        if (req.query.status) {
            query.status = req.query.status;
        }

        // Filter by type
        if (req.query.type) {
            query.type = req.query.type;
        }

        const items = await Item.find(query)
            .populate('category')
            .sort({ dateReported: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Item.countDocuments(query);

        res.render('user/my-items', {
            title: 'My Items - Lost & Found',
            items,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            query: req.query
        });
    } catch (error) {
        console.error('My items error:', error);
        req.flash('error', 'Error loading items');
        res.redirect('/user/dashboard');
    }
};

// Get settings page
exports.getSettings = async (req, res) => {
    try {
        const user = await User.findById(req.session.user._id);
        
        res.render('user/settings', {
            title: 'Settings - Lost & Found',
            user
        });
    } catch (error) {
        console.error('Settings error:', error);
        req.flash('error', 'Error loading settings');
        res.redirect('/user/dashboard');
    }
};

// Update settings
exports.updateSettings = async (req, res) => {
    try {
        const { emailOnApproval, emailOnRejection, emailOnClaim, emailOnMatch } = req.body;

        await User.findByIdAndUpdate(req.session.user._id, {
            notificationPreferences: {
                emailOnApproval: emailOnApproval === 'on',
                emailOnRejection: emailOnRejection === 'on',
                emailOnClaim: emailOnClaim === 'on',
                emailOnMatch: emailOnMatch === 'on'
            }
        });

        req.flash('success', 'Settings updated successfully');
        res.redirect('/user/settings');
    } catch (error) {
        console.error('Update settings error:', error);
        req.flash('error', 'Error updating settings');
        res.redirect('/user/settings');
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.session.user._id;

        // Check if username/email already taken
        const existingUser = await User.findOne({
            $or: [{ username }, { email }],
            _id: { $ne: userId }
        });

        if (existingUser) {
            req.flash('error', 'Username or email already taken');
            return res.redirect('/user/settings');
        }

        const user = await User.findByIdAndUpdate(userId, {
            username,
            email
        }, { new: true });

        // Update session
        req.session.user.username = user.username;
        req.session.user.email = user.email;

        req.flash('success', 'Profile updated successfully');
        res.redirect('/user/settings');
    } catch (error) {
        console.error('Update profile error:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('/user/settings');
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user._id;

        if (newPassword !== confirmPassword) {
            req.flash('error', 'New passwords do not match');
            return res.redirect('/user/settings');
        }

        const user = await User.findById(userId);
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            req.flash('error', 'Current password is incorrect');
            return res.redirect('/user/settings');
        }

        user.password = newPassword;
        await user.save();

        req.flash('success', 'Password changed successfully');
        res.redirect('/user/settings');
    } catch (error) {
        console.error('Change password error:', error);
        req.flash('error', 'Error changing password');
        res.redirect('/user/settings');
    }
};
