/**
 * ============================================================
 * ITEM MODEL
 * ============================================================
 * 
 * This file defines the Item schema for MongoDB.
 * An Item represents a lost or found item reported by users.
 * 
 * WHAT THIS MODEL STORES:
 * - itemName: Name of the lost/found item
 * - category: Type of item (Electronics, Clothing, etc.)
 * - description: Detailed description of the item
 * - location: Where the item was lost or found
 * - imagePath: URL to the item's image (stored in Cloudinary)
 * - type: Either 'lost' or 'found'
 * - status: pending, approved, claimed, or rejected
 * - reportedBy: Reference to User who reported it
 * - potentialMatches: Array of similar items for matching
 * 
 * WORKFLOW:
 * 1. User submits report → status = 'pending'
 * 2. Admin reviews → status = 'approved' or 'rejected'
 * 3. Owner claims → status = 'claimed'
 * 
 * RELATIONSHIPS:
 * - Belongs to a Category (foreign key reference)
 * - Belongs to a User (who reported it)
 * - Can have many ClaimRequests
 * 
 * ============================================================
 */

const mongoose = require('mongoose');

/**
 * ITEM SCHEMA DEFINITION
 * Defines all fields an item document will have in MongoDB
 */
const itemSchema = new mongoose.Schema({
    // Item name - what the item is called
    itemName: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    
    // Category - reference to Category collection
    // ObjectId is MongoDB's unique identifier type
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',  // References the Category model
        required: [true, 'Category is required']
    },
    
    // Description - detailed info about the item
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Location - where item was lost or found
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    
    // Location ID - if user selected from dropdown
    locationId: {
        type: String,
        default: null
    },
    
    // Custom Location - if user typed their own location
    customLocation: {
        type: String,
        default: null
    },
    
    // Image Path - URL to image stored in Cloudinary
    imagePath: {
        type: String,
        default: null
    },
    
    // Contact Info - how to reach the reporter
    contactInfo: {
        type: String,
        required: [true, 'Contact information is required'],
        trim: true,
        maxlength: [200, 'Contact info cannot exceed 200 characters']
    },
    
    // Reported By - reference to User who submitted report
    // Can be null for guest reports
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    
    // Reporter Name - name of person who reported
    reporterName: {
        type: String,
        required: [true, 'Reporter name is required'],
        trim: true,
        maxlength: [100, 'Reporter name cannot exceed 100 characters']
    },
    
    // Reporter Email - email of person who reported
    reporterEmail: {
        type: String,
        required: [true, 'Reporter email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    
    // Type - is this a lost or found item?
    type: {
        type: String,
        enum: ['lost', 'found'],  // Only these values allowed
        required: [true, 'Item type is required']
    },
    
    // Status - current state of the item report
    // pending: waiting for admin review
    // approved: published on website
    // claimed: item has been returned to owner
    // rejected: admin rejected the report
    status: {
        type: String,
        enum: ['pending', 'approved', 'claimed', 'rejected'],
        default: 'pending'
    },
    
    // Date Reported - when the report was submitted
    dateReported: {
        type: Date,
        default: Date.now
    },
    
    // Date Lost/Found - when the item was actually lost or found
    dateLostFound: {
        type: Date,
        required: [true, 'Date lost/found is required']
    },
    
    // Claimed By - info about who claimed the item
    claimedBy: {
        name: String,
        email: String,
        phone: String,
        date: Date
    },
    
    // Admin Notes - internal notes from admin
    adminNotes: {
        type: String,
        default: ''
    },
    
    // Potential Matches - array of similar items
    // Used to suggest matches between lost and found items
    potentialMatches: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        score: Number,  // How similar the items are (0-100)
        matchedAt: { type: Date, default: Date.now },
        dismissed: { type: Boolean, default: false }  // User dismissed this match
    }]
}, {
    timestamps: true  // Adds createdAt and updatedAt fields
});

/**
 * TEXT INDEX
 * Enables full-text search on itemName, description, and location
 * Users can search for items using keywords
 */
itemSchema.index({ itemName: 'text', description: 'text', location: 'text' });

/**
 * VIRTUAL PROPERTIES
 * These are computed fields that aren't stored in the database
 * They format dates nicely for display
 */
itemSchema.virtual('formattedDateReported').get(function() {
    return this.dateReported.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

itemSchema.virtual('formattedDateLostFound').get(function() {
    return this.dateLostFound.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
});

// Include virtual fields when converting to JSON
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

// Export the model
module.exports = mongoose.model('Item', itemSchema);
