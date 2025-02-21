const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Guild = require('../database/models/guild');

module.exports = {
    name: 'setwelcomechannel',
    description: 'Sets the welcome message channel for the server.',
    aliases: ['welcome'], // ✅ Aliases for alternative command usage
    category: 'Configuration',
    usage: 'welcome <#channel> OR welcome <channel_id>', // ✅ Corrected usage instruction
    async execute(message, args) {
        try {
            // ✅ Check if the user has Administrator permission
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return message.channel.send('❌ You do not have permission to set the welcome channel. (Admin only)');
            }

            // ✅ Ensure a channel argument is provided
            if (!args[0]) {
                return message.channel.send('⚠️ Please provide a channel mention or channel ID. Example: `welcome #general`');
            }

            // ✅ Get the channel from mention or ID
            let channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);

            // ✅ If channel is not found, return an error message
            if (!channel) {
                return message.channel.send('❌ Channel not found! Please mention a valid channel or provide a correct channel ID.');
            }

            const guildId = message.guild.id;

            // ✅ Update or create the guild's welcome channel in the database
            await Guild.findOneAndUpdate(
                { guildID: guildId },
                { welcomeChannelID: channel.id },
                { upsert: true, new: true }
            );

            // ✅ Update the cached welcome channel for better performance
            const guildData = await Guild.findOne({ guildID: guildId });
            message.client.guildCache.set(guildId, guildData);

            // ✅ Send a confirmation message with an embed
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('✅ Welcome Channel Set Successfully!')
                .setDescription(`Welcome messages will now be sent in ${channel}.`)
                .addFields(
                    { name: '📌 Channel', value: `${channel}`, inline: true },
                    { name: '👤 Set by', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp();

            return message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('❌ Error setting welcome channel:', error);
            return message.channel.send('⚠️ An unexpected error occurred while setting the welcome channel. Please try again later.');
        }
    },
};
