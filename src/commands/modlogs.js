
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'modlogs',
    category: 'Moderation',
    description: 'View moderation logs for a user',
    usage: '!modlogs [user]',
    userPermissions: [PermissionFlagsBits.ViewAuditLog],
    async execute(message, args) {
        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        
        try {
            const auditLogs = await message.guild.fetchAuditLogs({
                limit: 10,
                user: target
            });

            const embed = new EmbedBuilder()
                .setTitle(`Moderation Logs ${target ? `for ${target.user.tag}` : ''}`)
                .setColor('#2F3136')
                .setTimestamp();

            const logs = auditLogs.entries.map(log => {
                return `**Action:** ${log.action}\n**Target:** ${log.target}\n**Reason:** ${log.reason || 'No reason provided'}\n**Date:** ${log.createdAt.toLocaleString()}\n`;
            }).join('\n');

            embed.setDescription(logs || 'No moderation logs found.');
            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.reply('Failed to fetch moderation logs.');
        }
    }
};
