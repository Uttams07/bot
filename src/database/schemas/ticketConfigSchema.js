
const mongoose = require('mongoose');

const ticketConfigSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    ticketChannelId: { type: String },
    ticketLogChannelId: { type: String },
    ticketCategory: { type: String },
    lastTicketNumber: { type: Number, default: 0 }
});

module.exports = mongoose.model('TicketConfig', ticketConfigSchema);
