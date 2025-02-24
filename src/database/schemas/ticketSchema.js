
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    creatorId: { type: String, required: true },
    ticketNumber: { type: Number, required: true },
    status: { type: String, default: 'open' },
    createdAt: { type: Date, default: Date.now },
    closedAt: { type: Date },
    closedBy: { type: String }
});

module.exports = mongoose.model('Ticket', ticketSchema);
