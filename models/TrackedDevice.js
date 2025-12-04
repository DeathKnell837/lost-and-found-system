const mongoose = require('mongoose');

const trackedDeviceSchema = new mongoose.Schema({
    fingerprint: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    ipAddresses: [{
        ip: String,
        firstSeen: { type: Date, default: Date.now },
        lastSeen: { type: Date, default: Date.now },
        count: { type: Number, default: 1 }
    }],
    userAgent: String,
    browser: {
        name: String,
        version: String
    },
    os: {
        name: String,
        version: String
    },
    device: {
        type: { type: String, default: 'desktop' },
        vendor: String,
        model: String
    },
    users: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        firstSeen: { type: Date, default: Date.now },
        lastSeen: { type: Date, default: Date.now },
        loginCount: { type: Number, default: 1 }
    }],
    visits: {
        type: Number,
        default: 1
    },
    firstSeen: {
        type: Date,
        default: Date.now
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isSuspicious: {
        type: Boolean,
        default: false
    },
    suspiciousReasons: [String],
    country: String,
    city: String,
    pages: [{
        path: String,
        visitedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Index for efficient queries
trackedDeviceSchema.index({ lastSeen: -1 });
trackedDeviceSchema.index({ isBlocked: 1 });
trackedDeviceSchema.index({ 'users.user': 1 });

module.exports = mongoose.model('TrackedDevice', trackedDeviceSchema);
