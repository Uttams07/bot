const { PermissionsBitField } = require('discord.js');
const Guild = require('../database/models/guild');

module.exports = {
    name: 'unhide',
    description: 'Unhides a channel, making it visible to everyone.',
    aliases: ['uchannel'],
    category: 'Moderation',
    usage: '<channel>',
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.channel.send('You do not have permission to unhide channels.');
        }

        // Get the channel to unhide (default to the current channel if none specified)
        const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;

        // Update the channel permissions
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, { 
            [PermissionsBitField.Flags.ViewChannel]: true 
        });

        // Update the database
        const guildData = await Guild.findOne({ guildID: message.guild.id });
        if (!guildData) {
            return message.channel.send('Guild data not found.');
        }

        // Remove the channel ID from the hidden channels array
        if (guildData.hiddenChannels.includes(channel.id)) {
            guildData.hiddenChannels = guildData.hiddenChannels.filter(id => id !== channel.id);
            await guildData.save();
        }

        message.channel.send(`The channel ${channel} has been unhidden and is now visible to everyone.`);
        
        if (guildData && guildData.modLogChannelID) {
            const modLogChannel = message.guild.channels.cache.get(guildData.modLogChannelID);
            if (modLogChannel) {
                modLogChannel.send(logMessage);
            }
        }
    },
};