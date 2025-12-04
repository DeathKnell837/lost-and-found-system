const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
        maxlength: [100, 'Item name cannot exceed 100 characters']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [200, 'Location cannot exceed 200 characters']
    },
    locationId: {
        type: String,
        default: null  // Stores ID from predefined locations
    },
    customLocation: {
        type: String,
        default: null  // For "Other" locations
    },
    imagePath: {
        type: String,
        default: null
    },
    contactInfo: {
        type: String,
        required: [true, 'Contact information is required'],
        trim: true,
        maxlength: [200, 'Contact info cannot exceed 200 characters']
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    reporterName: {
        type: String,
        required: [true, 'Reporter name is required'],
        trim: true,
        maxlength: [100, 'Reporter name cannot exceed 100 characters']
    },
    reporterEmail: {
        type: String,
        required: [true, 'Reporter email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    type: {
        type: String,
        enum: ['lost', 'found'],
        required: [true, 'Item type is required']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'claimed', 'rejected'],
        default: 'pending'
    },
    dateReported: {
        type: Date,
        default: Date.now
    },
    dateLostFound: {
        type: Date,
        required: [true, 'Date lost/found is required']
    },
    claimedBy: {
        name: String,
        email: String,
        phone: String,
        date: Date
    },
    adminNotes: {
        type: String,
        default: ''
    },
    // Item Matching
    potentialMatches: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
        score: Number,
        matchedAt: { type: Date, default: Date.now },
        dismissed: { type: Boolean, default: false }
    }]
}, {
    timestamps: true
});

// Index for search functionality
itemSchema.index({ itemName: 'text', description: 'text', location: 'text' });

// Virtual for formatted date
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

// Ensure virtuals are included in JSON
itemSchema.set('toJSON', { virtuals: true });
itemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);
