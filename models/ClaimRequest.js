const mongoose = require('mongoose');

const claimRequestSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    claimant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        required: [true, 'Please describe why you believe this is your item'],
        minlength: [20, 'Description must be at least 20 characters'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    proofOfOwnership: {
        type: String,
        required: [true, 'Please provide proof of ownership'],
        minlength: [10, 'Proof must be at least 10 characters']
    },
    proofImages: [{
        url: String,
        publicId: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    identifyingFeatures: {
        type: String,
        default: ''
    },
    contactPhone: {
        type: String,
        default: ''
    },
    preferredContactMethod: {
        type: String,
        enum: ['email', 'phone', 'both'],
        default: 'email'
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'approved', 'rejected', 'withdrawn'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: Date,
    rejectionReason: String,
    priority: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    },
    timeline: [{
        action: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Index for faster queries
claimRequestSchema.index({ item: 1, status: 1 });
claimRequestSchema.index({ claimant: 1, status: 1 });
claimRequestSchema.index({ status: 1, createdAt: -1 });

// Prevent duplicate pending claims from same user on same item
claimRequestSchema.index(
    { item: 1, claimant: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { status: { $in: ['pending', 'under_review'] } }
    }
);

// Virtual for claim age
claimRequestSchema.virtual('age').get(function() {
    const now = new Date();
    const diff = now - this.createdAt;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
});

// Add to timeline when status changes
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
