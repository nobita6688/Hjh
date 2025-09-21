const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    ticketId: {
        type: Number,
        required: true,
        unique: true
    },
    channelId: {
        type: String,
        required: true,
        unique: true
    },
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    ticketType: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        default: 'Low'
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'deleted'],
        default: 'open'
    },
    claimedBy: {
        type: String,
        default: null
    },
    claimedAt: {
        type: Date,
        default: null
    },
    closedBy: {
        type: String,
        default: null
    },
    closedAt: {
        type: Date,
        default: null
    },
    messages: [{
        userId: String,
        username: String,
        content: String,
        timestamp: Date
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);