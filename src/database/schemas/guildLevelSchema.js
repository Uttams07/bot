
const mongoose = require('mongoose');

const guildLevelSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    cooldown: { type: Number, default: 60 },
    messageXP: { type: Number, default: 15 },
    voiceXP: { type: Number, default: 5 },
    xpMultiplier: { type: Number, default: 1 },
    announcementChannel: { type: String },
    levelRoles: [{
        level: Number,
        roleId: String
    }],
    disabledChannels: [String]
});

module.exports = mongoose.model('GuildLevel', guildLevelSchema);
