const Guild = require('../database/models/guild');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setmodlogchannel',
    description: 'Sets the moderation log channel for the server',
    aliases: ['smc'], // Command aliases
    category: 'Configuration', // Command category
    usage: 'setmodlogchannel #channel/channel Id', // Command usage instructions
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.channel.send('You do not have permission to set the mod log channel.');
        }

        if (!args[0]) {
            return message.channel.send('Please provide a channel mention or ID.');
        }

        // Get the channel from the mention or channel ID
        let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

        // If channel is not found, return
        if (!channel) {
            return message.channel.send('Channel not found.');
        }

        const guildId = message.guild.id;

        // Update or create the guild's mod log channel in the database
        await Guild.findOneAndUpdate(
            { guildID: guildId },
            { modLogChannelID: channel.id },
            { upsert: true, new: true }
        );

        // Update the cached mod log channel
        const guildData = await Guild.findOne({ guildID: guildId });
        message.client.guildCache.set(guildId, guildData);

        // Send a confirmation message
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Mod Log Channel Set')
            .setDescription(`Successfully set the moderation log channel to ${channel}.`)
            .addFields(
                { name: 'Channel', value: `${channel}`, inline: true },
                { name: 'Set by', value: `${message.author.tag}`, inline: true }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};
