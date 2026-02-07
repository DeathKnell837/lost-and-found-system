/**
 * ============================================================================
 * AUTHENTICATION CONTROLLER (authController.js)
 * ============================================================================
 * 
 * PURPOSE:
 * This controller handles all authentication-related operations:
 * - User registration (creating new accounts)
 * - User login (verifying credentials)
 * - User logout (ending sessions)
 * - Email verification
 * - User profile management
 * 
 * HOW AUTHENTICATION WORKS:
 * 1. User submits login form with username/password
 * 2. Controller finds user in database
 * 3. Controller compares password with stored hash
 * 4. If match, create a session (like a VIP pass)
 * 5. User is now "logged in" until session expires
 * 
 * SECURITY FEATURES:
 * - Passwords are never stored in plain text
 * - bcrypt hashing with salt (10 rounds)
 * - Session-based authentication
 * - Account activation check
 * 
 * ============================================================================
 */

// Import User model for database operations
const { User } = require('../models');

// Crypto module for generating secure random tokens
const crypto = require('crypto');

// Email service for sending verification emails
const emailService = require('../services/emailService');

/**
 * GET LOGIN PAGE
 * 
 * Route: GET /auth/login
 * Purpose: Display the login form
 */
exports.getLoginPage = (req, res) => {
    res.render('auth/login', {
        title: 'Login - Lost & Found'
    });
};

/**
 * GET REGISTER PAGE
 * 
 * Route: GET /auth/register
 * Purpose: Display the registration form
 */
exports.getRegisterPage = (req, res) => {
    res.render('auth/register', {
        title: 'Register - Lost & Found'
    });
};

/**
 * HANDLE USER REGISTRATION
 * 
 * Route: POST /auth/register
 * Purpose: Create a new user account
 * 
 * Process Flow:
 * 1. Get form data (username, email, password)
 * 2. Validate passwords match
 * 3. Check if user already exists
 * 4. Create new user in database
 * 5. Redirect to login page
 * 
 * @param {Object} req - Contains form data in req.body
 * @param {Object} res - Used to redirect after processing
 */
exports.register = async (req, res) => {
    try {
        // EXTRACT FORM DATA
        // Destructuring: extract specific properties from req.body object
        const { username, email, password, confirmPassword } = req.body;

        // VALIDATION: Check if passwords match
        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect('/auth/register');
        }

        // CHECK FOR EXISTING USER
        // $or operator: find user where email OR username matches
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            req.flash('error', 'Username or email already exists');
            return res.redirect('/auth/register');
        }

        // CREATE NEW USER
        // Password will be automatically hashed by the User model's pre-save hook
        const user = new User({
            username,
            email,
            password,                // Will be hashed before saving
            role: 'user',           // Default role (not admin)
            isEmailVerified: true   // Auto-verify for simplicity
        });

        // Save to database
        await user.save();

        // Show success message and redirect to login
        req.flash('success', 'Registration successful! You can now log in.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Registration error:', error);
        req.flash('error', 'Registration failed. Please try again.');
        res.redirect('/auth/register');
    }
};

/**
 * VERIFY EMAIL
 * 
 * Route: GET /auth/verify/:token
 * Purpose: Verify user's email address using token from email link
 * 
 * How it works:
 * 1. User clicks link in verification email
 * 2. Link contains a unique token
 * 3. We find user with matching token
 * 4. Mark email as verified
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        
        // Hash the token to compare with stored hash (security measure)
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        
        // Find user with matching token that hasn't expired
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }  // Token not expired
        });

        if (!user) {
            req.flash('error', 'Invalid or expired verification link. Please request a new one.');
            return res.redirect('/auth/login');
        }

        // VERIFY THE EMAIL
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;    // Clear the token
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

/**
 * RESEND VERIFICATION EMAIL
 * 
 * Route: POST /auth/resend-verification
 * Purpose: Send a new verification email if the old one expired
 */
exports.resendVerification = async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find unverified user with this email
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

/**
 * HANDLE USER LOGIN
 * 
 * Route: POST /auth/login
 * Purpose: Authenticate user and create session
 * 
 * Process Flow:
 * 1. Get username/password from form
 * 2. Find user in database
 * 3. Compare password with hash
 * 4. Create session if valid
 * 5. Redirect to home page
 * 
 * @param {Object} req - Contains login credentials in req.body
 * @param {Object} res - Used to redirect after authentication
 */
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // FIND USER
        // Allow login with either username OR email
        const user = await User.findOne({
            $or: [{ username }, { email: username }]
        });

        if (!user) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/auth/login');
        }

        // VERIFY PASSWORD
        // comparePassword() is a method defined in the User model
        // It uses bcrypt.compare() to check the hash
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('error', 'Invalid credentials');
            return res.redirect('/auth/login');
        }

        // CHECK IF ACCOUNT IS ACTIVE
        // Admin can deactivate accounts
        if (!user.isActive) {
            req.flash('error', 'Your account has been deactivated');
            return res.redirect('/auth/login');
        }

        // CREATE SESSION
        // Store user info in session (like a VIP pass)
        // This data will be available on every subsequent request
        req.session.user = {
            id: user._id,
            _id: user._id,
            username: user.username,
            email: user.email,
            role: user.role        // 'user' or 'admin'
        };

        req.flash('success', 'Welcome back, ' + user.username + '!');
        
        // Redirect to page user was trying to access, or home
        const returnTo = req.session.returnTo || '/';
        delete req.session.returnTo;
        res.redirect(returnTo);
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Login failed. Please try again.');
        res.redirect('/auth/login');
    }
};

/**
 * GET FORGOT PASSWORD PAGE
 * Route: GET /auth/forgot-password
 */
exports.getForgotPasswordPage = (req, res) => {
    res.render('auth/forgot-password', {
        title: 'Forgot Password - Lost & Found'
    });
};

/**
 * HANDLE FORGOT PASSWORD
 * Route: POST /auth/forgot-password
 * Purpose: Send password reset email with token
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal if email exists (security)
            req.flash('success', 'If an account with that email exists, a reset link has been sent.');
            return res.redirect('/auth/forgot-password');
        }

        // Generate reset token
        const resetToken = user.generatePasswordResetToken();
        await user.save();

        // Send reset email
        const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${resetToken}`;
        const subject = '🔑 Password Reset Request';
        const content = `
            <h2>Password Reset</h2>
            <p>Hi <strong>${user.username}</strong>,</p>
            <p>You requested a password reset. Click the button below to set a new password:</p>
            <a href="${resetUrl}" style="display:inline-block;background:#0d6efd;color:white;padding:12px 30px;text-decoration:none;border-radius:5px;margin:15px 0;">Reset Password</a>
            <p>This link will expire in <strong>1 hour</strong>.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
        `;

        await emailService.sendEmail(user.email, subject, content);

        req.flash('success', 'If an account with that email exists, a reset link has been sent.');
        res.redirect('/auth/forgot-password');
    } catch (error) {
        console.error('Forgot password error:', error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/auth/forgot-password');
    }
};

/**
 * GET RESET PASSWORD PAGE
 * Route: GET /auth/reset-password/:token
 */
exports.getResetPasswordPage = async (req, res) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Reset link is invalid or has expired.');
            return res.redirect('/auth/forgot-password');
        }

        res.render('auth/reset-password', {
            title: 'Reset Password - Lost & Found',
            token: req.params.token
        });
    } catch (error) {
        console.error('Reset password page error:', error);
        req.flash('error', 'Something went wrong.');
        res.redirect('/auth/forgot-password');
    }
};

/**
 * HANDLE RESET PASSWORD
 * Route: POST /auth/reset-password/:token
 */
exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            req.flash('error', 'Passwords do not match');
            return res.redirect(`/auth/reset-password/${req.params.token}`);
        }

        if (password.length < 6) {
            req.flash('error', 'Password must be at least 6 characters');
            return res.redirect(`/auth/reset-password/${req.params.token}`);
        }

        const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });

        if (!user) {
            req.flash('error', 'Reset link is invalid or has expired.');
            return res.redirect('/auth/forgot-password');
        }

        // Set new password (will be hashed by pre-save hook)
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        req.flash('success', 'Password reset successful! You can now log in with your new password.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Reset password error:', error);
        req.flash('error', 'Something went wrong. Please try again.');
        res.redirect('/auth/forgot-password');
    }
};

/**
 * HANDLE LOGOUT
 * 
 * Route: GET /auth/logout
 * Purpose: End user session
 */
exports.logout = (req, res) => {
    // Remove user data from session
    delete req.session.user;
    req.flash('success', 'You have been logged out');
    res.redirect('/');
};

/**
 * GET USER PROFILE
 * 
 * Route: GET /auth/profile
 * Purpose: Display user's profile page with their reported items
 */
exports.getProfile = async (req, res) => {
    try {
        // Get full user data from database
        const user = await User.findById(req.session.user.id);
        const { Item } = require('../models');
        
        // Get all items reported by this user
        const myItems = await Item.find({ reportedBy: user._id })
            .populate('category')
            .sort({ dateReported: -1 });  // Newest first

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
