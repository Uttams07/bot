
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'tempmute',
    category: 'Moderation',
    description: 'Temporarily mutes a user',
    usage: '!tempmute <user> <duration> [reason]',
    userPermissions: [PermissionFlagsBits.ModerateMembers],
    async execute(message, args) {
        if (args.length < 2) {
            return message.reply('Usage: !tempmute <user> <duration> [reason]');
        }

        const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
        if (!target) return message.reply('Please specify a valid user to mute.');

        const duration = ms(args[1]);
        if (!duration) return message.reply('Please specify a valid duration (e.g., 1h, 30m, 1d)');

        const reason = args.slice(2).join(' ') || 'No reason provided';

        try {
            await target.timeout(duration, reason);
            
            const embed = new EmbedBuilder()
                .setTitle('User Temporarily Muted')
                .setColor('#FF4444')
                .setDescription(`**User:** ${target.user.tag}\n**Duration:** ${args[1]}\n**Reason:** ${reason}`)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.reply('Failed to mute the user. Check my permissions and role hierarchy.');
        }
    }
};
