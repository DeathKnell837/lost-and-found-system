const { User } = require('../models');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Show login page
exports.getLoginPage = (req, res) => {
    res.render('auth/login', {
        title: 'Login - Lost & Found'
    });
};

// Show register page
exports.getRegisterPage = (req, res) => {
    res.render('auth/register', {
        title: 'Register - Lost & Found'
    });
};

// Handle user registration
exports.register = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Validate passwords match
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/auth/register');
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            req.flash('error', 'Username or email already exists');
            return res.redirect('/auth/register');
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role: 'user',
            isEmailVerified: true // Auto-verify
        });

        await user.save();

        req.flash('success', 'Registration successful! You can now log in.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Registration failed. Please try again.');
        res.redirect('/auth/register');
    }
};

// Verify email
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Hash the token to compare with stored hash
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Invalid or expired verification link. Please request a new one.');
            return res.redirect('/auth/login');
        }

        // Verify the email
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Send confirmation email
        await emailService.sendEmailVerifiedEmail(user);

        req.flash('success', 'Email verified successfully! You can now log in.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Email verification error:', error);
        req.flash('error', 'Verification failed. Please try again.');
        res.redirect('/auth/login');
    }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        
        const user = await User.findOne({ email, isEmailVerified: false });
        
        if (!user) {
            req.flash('error', 'No unverified account found with this email.');
            return res.redirect('/auth/login');
        }

        // Generate new verification token
        const verificationToken = user.generateEmailVerificationToken();
        await user.save();

        // Send verification email
        await emailService.sendEmailVerificationEmail(user, verificationToken);

        req.flash('success', 'Verification email sent! Please check your inbox.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Resend verification error:', error);
        req.flash('error', 'Failed to resend verification email.');
        res.redirect('/auth/login');
    }
};

// Handle user login
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/auth/login');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/auth/login');
        }

        // Check if user is active
        if (!user.isActive) {
            req.flash('error', 'Your account has been deactivated');
            return res.redirect('/auth/login');
        }

        // Set session
        req.session.user = {
            id: user._id,
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        };

        req.flash('success', 'Welcome back, ' + user.username + '!');
        
        // Regular users go to home page
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/auth/login');
    }
};

// Handle logout (only destroys user session, keeps admin session)
exports.logout = (req, res) => {
    delete req.session.user;
    req.flash('success', 'You have been logged out');
    res.redirect('/');
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id);
        const { Item } = require('../models');
        
        // Get user's reported items
        const myItems = await Item.find({ reportedBy: user._id })
            .populate('category')
            .sort({ dateReported: -1 });

        res.render('auth/profile', {
            title: 'My Profile - Lost & Found',
            profile: user,
            myItems
        });
    } catch (error) {
        console.error('Profile error:', error);
        req.flash('error', 'Error loading profile');
        res.redirect('/');
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { username, email } = req.body;
        const userId = req.session.user.id;

        // Check if username/email exists for other users
        const existing = await User.findOne({
            $or: [{ username }, { email }],
            _id: { $ne: userId }
        });

        if (existing) {
            req.flash('error', 'Username or email already in use');
            return res.redirect('/auth/profile');
        }

        await User.findByIdAndUpdate(userId, { username, email });

        // Update session
        req.session.user.username = username;
        req.session.user.email = email;

        req.flash('success', 'Profile updated successfully');
        res.redirect('/auth/profile');
    } catch (error) {
        console.error('Update profile error:', error);
        req.flash('error', 'Error updating profile');
        res.redirect('/auth/profile');
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const userId = req.session.user.id;

        if (newPassword !== confirmPassword) {
            req.flash('error', 'New passwords do not match');
            return res.redirect('/auth/profile');
        }

        const user = await User.findById(userId);
        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            req.flash('error', 'Current password is incorrect');
            return res.redirect('/auth/profile');
        }

        user.password = newPassword;
        await user.save();

        req.flash('success', 'Password changed successfully');
        res.redirect('/auth/profile');
    } catch (error) {
        console.error('Change password error:', error);
        req.flash('error', 'Error changing password');
        res.redirect('/auth/profile');
    }
};
