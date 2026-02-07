/**
 * ============================================================
 * CLAIM REQUEST MODEL
 * ============================================================
 * 
 * This file defines the ClaimRequest schema for MongoDB.
 * A ClaimRequest is submitted when a user believes they are
 * the owner of a reported item and wants to claim it.
 * 
 * WHAT THIS MODEL STORES:
 * - item: Which item is being claimed
 * - claimant: Who is claiming the item
 * - description: Why they believe it's theirs
 * - proofOfOwnership: Evidence they own it
 * - proofImages: Photos as proof
 * - status: pending, under_review, approved, rejected, withdrawn
 * 
 * WORKFLOW:
 * 1. User sees item and clicks "Claim"
 * 2. User fills out claim form with proof
 * 3. Admin reviews the claim
 * 4. Admin approves or rejects
 * 5. If approved, item is marked as claimed
 * 
 * RELATIONSHIPS:
 * - Belongs to an Item (the item being claimed)
 * - Belongs to a User (the claimant)
 * - ReviewedBy references a User (admin who reviewed)
 * 
 * ============================================================
 */

const mongoose = require('mongoose');

/**
 * CLAIM REQUEST SCHEMA DEFINITION
 */
const claimRequestSchema = new mongoose.Schema({
    // Item being claimed - reference to Item collection
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    
    // Claimant - the user making the claim
    claimant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
    // Description - why they believe it's their item
    description: {
        type: String,
        required: [true, 'Please describe why you believe this is your item'],
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Proof of Ownership - text description of proof
    proofOfOwnership: {
        type: String,
        required: [true, 'Please provide proof of ownership'],
        minlength: [10, 'Proof must be at least 10 characters']
    },
    
    // Proof Images - uploaded photos as evidence
    proofImages: [{
        url: String,           // Cloudinary URL
        publicId: String,      // Cloudinary public ID for deletion
        uploadedAt: { type: Date, default: Date.now }
    }],
    
    // Identifying Features - unique marks, scratches, etc.
    identifyingFeatures: {
        type: String,
        default: ''
    },
    
    // Contact Phone - phone number for contact
    contactPhone: {
        type: String,
        default: ''
    },
    
    // Preferred Contact Method
    preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'both'],
        default: 'email'
    },
    
    // Status - current state of the claim
    // pending: waiting for admin review
    // under_review: admin is reviewing
    // approved: claim accepted, item returned
    // rejected: claim denied
    // withdrawn: user cancelled their claim
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    
    // Admin Notes - internal notes from admin
    adminNotes: {
        type: String,
        default: ''
    },
    
    // Reviewed By - which admin reviewed the claim
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    // Reviewed At - when the claim was reviewed
    reviewedAt: Date,
    
    // Rejection Reason - why claim was rejected
    rejectionReason: String,
    
    // Priority - how urgent is this claim
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    
    // Timeline - history of actions on this claim
    timeline: [{
        action: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true  // Adds createdAt and updatedAt
});

/**
 * DATABASE INDEXES
 * Indexes make database queries faster
 */
claimRequestSchema.index({ item: 1, status: 1 });
claimRequestSchema.index({ claimant: 1, status: 1 });
claimRequestSchema.index({ status: 1, createdAt: -1 });

// Prevent same user from submitting multiple pending claims on same item
claimRequestSchema.index(
    { item: 1, claimant: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { status: { $in: ['pending', 'under_review'] } }
    }
);

/**
 * VIRTUAL - CLAIM AGE
 * Computes how old the claim is
 */
claimRequestSchema.virtual('age').get(function() {
    const now = new Date();
    const diff = now - this.createdAt;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
});

/**
 * MIDDLEWARE - AUTO-UPDATE TIMELINE
 * Automatically adds entry to timeline when status changes
 */
claimRequestSchema.pre('save', function(next) {
    if (this.isModified('status') && !this.isNew) {
        this.timeline.push({
            action: `Status changed to ${this.status}`,
            performedBy: this.reviewedBy,
            timestamp: new Date()
        });
    }
    next();
});

module.exports = mongoose.model('ClaimRequest', claimRequestSchema);
