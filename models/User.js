/**
 * ============================================================
 * USER MODEL
 * ============================================================
 * 
 * This file defines the User schema for MongoDB.
 * A schema is like a blueprint that defines what data a user has.
 * 
 * WHAT THIS MODEL STORES:
 * - username: Unique name for login
 * - email: User's email address
 * - password: Encrypted password (hashed with bcrypt)
 * - role: Either 'user' or 'admin'
 * - isActive: Whether account is active
 * - isEmailVerified: Whether email has been verified
 * 
 * FEATURES:
 * - Password is automatically encrypted before saving
 * - Includes methods for password comparison
 * - Can generate tokens for email verification and password reset
 * 
 * RELATIONSHIPS:
 * - Users can report Items
 * - Users can submit ClaimRequests
 * - Admins can review/approve items and claims
 * 
 * ============================================================
 */

const mongoose = require('mongoose');  // MongoDB ODM (Object Data Modeling)
const bcrypt = require('bcryptjs');    // Password encryption library
const crypto = require('crypto');       // For generating random tokens

/**
 * USER SCHEMA DEFINITION
 * Defines all fields a user document will have in MongoDB
 */
const userSchema = new mongoose.Schema({
    // Username - must be unique, used for login
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,           // No two users can have same username
        trim: true,             // Remove whitespace from ends
        minlength: [3, 'Username must be at least 3 characters'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },
    
    // Email - must be unique and valid format
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,        // Convert to lowercase
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    
    // Password - will be hashed before saving
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    
    // Role - determines user permissions
    // 'user' = regular user, 'admin' = administrator
    role: {
        type: String,
        enum: ['user', 'admin'],  // Only these values allowed
        default: 'user'
    },
    
    // Account status
    isActive: {
        type: Boolean,
        default: true
    },
    
    // Email Verification Fields
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,      // Token sent to email
    emailVerificationExpires: Date,      // When token expires
    
    // Password Reset Fields
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // Notification Preferences - what emails user wants to receive
    notificationPreferences: {
        emailOnApproval: { type: Boolean, default: true },   // When item approved
        emailOnRejection: { type: Boolean, default: true },  // When item rejected
        emailOnClaim: { type: Boolean, default: true },      // When someone claims their item
        emailOnMatch: { type: Boolean, default: true }       // When potential match found
    }
}, {
    timestamps: true  // Automatically add createdAt and updatedAt fields
});

/**
 * PASSWORD HASHING MIDDLEWARE
 * This runs automatically before saving a user
 * It encrypts the password so it's not stored in plain text
 */
userSchema.pre('save', async function(next) {
    // Only hash password if it was modified (or is new)
    if (!this.isModified('password')) {
        return next();
    }
    
    // Generate salt (random string added to password before hashing)
    const salt = await bcrypt.genSalt(10);
    
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

/**
 * COMPARE PASSWORD METHOD
 * Used during login to check if entered password matches stored hash
 * @param candidatePassword - The password user entered
 * @returns boolean - true if passwords match
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * TO JSON METHOD
 * When converting user to JSON, remove password for security
 */
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;  // Never send password to client
    return user;
};

/**
 * GENERATE EMAIL VERIFICATION TOKEN
 * Creates a random token for email verification links
 * Token expires in 24 hours
 */
userSchema.methods.generateEmailVerificationToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    // Store hashed version of token in database
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return token;  // Return plain token to send in email
};

/**
 * GENERATE PASSWORD RESET TOKEN
 * Creates a random token for password reset links
 * Token expires in 1 hour
 */
userSchema.methods.generatePasswordResetToken = function() {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    return token;
};

// Export the model so it can be used in other files
module.exports = mongoose.model('User', userSchema);
