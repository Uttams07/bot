const { PermissionsBitField } = require('discord.js'); // ✅ Proper permissions handling
const Guild = require('../database/models/guild');

module.exports = {
    name: 'setprefix',
    description: 'Sets a new prefix for bot commands.',
    aliases: ['prefix'], // ✅ Aliases for alternative command usage
    category: 'Configuration',
    usage: 'setprefix <new_prefix> OR prefix <new_prefix>',
    async execute(message, args) {
        try {
            // ✅ Check if the user has Administrator permission OR is the Server Owner
            if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator) && message.author.id !== message.guild.ownerId) {
                return message.channel.send('❌ You do not have permission to change the prefix. Only Administrators or the Server Owner can do this.');
            }

            // ✅ Ensure a prefix argument is provided
            if (!args[0]) {
                return message.channel.send('⚠️ Please provide a new prefix! Example: `setprefix !`');
            }

            const newPrefix = args[0];
            const guildId = message.guild.id;

            // ✅ Update or create the guild prefix in the database
            await Guild.findOneAndUpdate(
                { guildID: guildId },
                { prefix: newPrefix },
                { upsert: true, new: true }
            );

            // ✅ Update the cached prefix for performance boost
            message.client.prefixCache.set(guildId, newPrefix);

            // ✅ Confirm the update to the user
            return message.channel.send(`✅ Prefix updated to: \`${newPrefix}\``);
        } catch (error) {
            console.error('❌ Error updating prefix:', error);
            return message.channel.send('⚠️ An error occurred while updating the prefix. Please try again later.');
        }
    },
};
