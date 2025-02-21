const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const Guild = require('../database/models/guild');

module.exports = {
    name: 'purge',
    description: 'Purges a specified number of messages from the channel.',
    aliases: ['clear', 'delete'],
    category: 'Moderation',
    usage: '<number>',
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.channel.send('You do not have permission to purge messages.');
        }

        // Check if a number is provided
        if (!args[0] || isNaN(args[0])) {
            return message.channel.send('Please provide a valid number of messages to purge.');
        }

        // Get the number of messages to purge
        const numMessages = parseInt(args[0]);

        // Check if the number is within the valid range
        if (numMessages < 1 || numMessages > 100) {
            return message.channel.send('Please provide a number between 1 and 100.');
        }

        // Purge the messages
        try {
            await message.channel.bulkDelete(numMessages + 1);
        } catch (error) {
            console.error('Error purging messages:', error);
            return message.channel.send('There was an error trying to purge messages.');
        }

        // Create an embed to log the purge
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('Messages Purged')
            .setDescription(`Purged ${numMessages} messages from ${message.channel} by ${message.author}.`)
            .setTimestamp();

        // Log the purge to the mod log channel if configured
        const guildData = await Guild.findOne({ guildID: message.guild.id });
        if (guildData && guildData.modLogChannelID) {
            const modLogChannel = message.guild.channels.cache.get(guildData.modLogChannelID);
            if (modLogChannel) {
                modLogChannel.send({ embeds: [embed] });
            }
        }

        // Send a confirmation message to the channel
        const confirmationMessage = await message.channel.send(`Purged ${numMessages} messages from ${message.channel}.`);

        // Delete the confirmation message after 3 seconds
        setTimeout(() => {
            confirmationMessage.delete().catch(err => console.error('Failed to delete confirmation message:', err));
        }, 3000);
    },
};