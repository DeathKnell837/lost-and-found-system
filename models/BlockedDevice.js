const mongoose = require('mongoose');

const blockedDeviceSchema = new mongoose.Schema({
    fingerprint: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    browser: {
        name: String,
        version: String
    },
    os: {
        name: String,
        version: String
    },
    device: {
        type: { type: String },
        vendor: String,
        model: String
    },
    blockedAt: {
        type: Date,
        default: Date.now
    },
    reason: {
        type: String,
        required: true
    },
    blockedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastAccessAttempt: {
        type: Date
    },
    accessAttempts: {
        type: Number,
        default: 0
    },
    blockHistory: [{
        action: {
            type: String,
            enum: ['blocked', 'unblocked']
        },
        date: {
            type: Date,
            default: Date.now
        },
        by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('BlockedDevice', blockedDeviceSchema);
