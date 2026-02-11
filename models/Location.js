const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Location name is required'],
        trim: true,
        maxlength: [100, 'Location name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters'],
        default: ''
    },
    // Status: 'approved' = official location, 'pending' = user-suggested, awaiting admin review
    status: {
        type: String,
        enum: ['approved', 'pending'],
        default: 'approved'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Who suggested this location (null for admin-created ones)
    suggestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
});

// Index for faster queries
locationSchema.index({ name: 1 });
locationSchema.index({ isActive: 1 });

module.exports = mongoose.model('Location', locationSchema);
