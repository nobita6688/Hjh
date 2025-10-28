const mongoose = require('mongoose');

const ticketCounterSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('TicketCounter', ticketCounterSchema);