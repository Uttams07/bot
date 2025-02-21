const { PermissionsBitField } = require('discord.js');
const Guild = require('../database/models/guild');

module.exports = {
    name: 'hide',
    description: 'Hides a channel from everyone except admins.',
    aliases: ['hchannel'],
    category: 'Moderation',
    usage: 'hide <channel>',
    async execute(message, args) {
        try {
            // Check if the user has the necessary permissions
            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
                return message.channel.send('You do not have permission to hide channels.');
            }

            // Get the channel to hide (default to the current channel if none specified)
            const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]) || message.channel;


            // Update the channel permissions
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, { 
                [PermissionsBitField.Flags.ViewChannel]: false 
            });

            // Optionally, you can also set permissions for specific roles if needed
            // await channel.permissionOverwrites.edit(message.guild.roles.cache.get('ROLE_ID'), { 
            //     [PermissionsBitField.Flags.ViewChannel]: true 
            // });

            // Update the database
            const guildData = await Guild.findOne({ guildID: message.guild.id });
            if (!guildData) {
                return message.channel.send('Guild data not found.');
            }

            // Add the channel ID to the hidden channels array
            if (!guildData.hiddenChannels.includes(channel.id)) {
                guildData.hiddenChannels.push(channel.id);
                await guildData.save();
            }

            message.channel.send(`The channel ${channel} has been hidden from everyone except admins.`);
        } catch (error) {
            console.error('Error hiding channel:', error);
            message.channel.send('There was an error trying to execute that command!');

        // Log the error
            const guildData = await Guild.findOne({ guildID: message.guild.id });
        if (guildData && guildData.modLogChannelID) {
            const modLogChannel = message.guild.channels.cache.get(guildData.modLogChannelID);
            if (modLogChannel) {
                modLogChannel.send(logMessage);
            }
        }
        }
    },
};