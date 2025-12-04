const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Item',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Comment cannot be empty'],
        minlength: [2, 'Comment must be at least 2 characters'],
        maxlength: [500, 'Comment cannot exceed 500 characters'],
        trim: true
    },
    type: {
        type: String,
        enum: ['comment', 'tip', 'question', 'update'],
        default: 'comment'
    },
    isHelpful: {
        type: Boolean,
        default: false
    },
    helpfulVotes: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        votedAt: { type: Date, default: Date.now }
    }],
    replies: [{
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        content: {
            type: String,
            maxlength: 300,
            trim: true
        },
        createdAt: { type: Date, default: Date.now }
    }],
    isPinned: {
        type: Boolean,
        default: false
    },
    isHidden: {
        type: Boolean,
        default: false
    },
    hiddenReason: String,
    hiddenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    editedAt: Date,
    isEdited: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient queries
commentSchema.index({ item: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ isHidden: 1 });

// Virtual for helpful count
commentSchema.virtual('helpfulCount').get(function() {
    return this.helpfulVotes ? this.helpfulVotes.length : 0;
});

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
    return this.replies ? this.replies.length : 0;
});

// Ensure virtuals are included in JSON
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Comment', commentSchema);
