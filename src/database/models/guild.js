const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
    guildID: { type: String, required: true, unique: true },
    prefix: { type: String, default: '!' },
    admins: { type: [String], default: [] }, // Array of admin user IDs
    welcomeChannelID: { type: String, default: null }, // Channel for welcome messages
    modLogChannelID: { type: String, default: null }, // Channel for moderation logs
    muteRoleID: { type: String, default: null }, // Role for muted users
    mutedUsers: { type: [String], default: [] },
    bannedUsers: { type: [Object], default: [] }, // Array of banned users
    joinDate: { type: Date, default: Date.now }, // Date when added to database
    settings: { type: Object, default: {} }, // Additional settings
    hiddenChannels: { type: [String], default: [] }, // Array of hidden channel IDs

    // Welcome message settings
    welcomeTitle: { type: String }, // Title of the welcome message embed
    welcomeDescription: { type: String }, // Description of the welcome message embed
    welcomeColor: { type: String }, // Color of the embed
    welcomeThumbnail: { type: String }, // URL for the thumbnail image in the embed
    welcomeFooter: { type: String }, // Footer text for the embed

    // Ghost ping settings
    greetPingChannels: { type: [String], default: [] }, // Array of channel IDs for greet pings
});

module.exports = mongoose.model('Guild', guildSchema);