
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    name: 'lockdown',
    category: 'Moderation',
    description: 'Locks down a channel or the entire server',
    usage: '!lockdown [channel] [reason]',
    userPermissions: [PermissionFlagsBits.ManageChannels],
    async execute(message, args) {
        const channel = message.mentions.channels.first() || message.channel;
        const reason = args.join(' ') || 'No reason provided';

        try {
            await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
                SendMessages: false
            });

            const embed = new EmbedBuilder()
                .setTitle('Channel Locked')
                .setColor('#FF0000')
                .setDescription(`🔒 ${channel} has been locked\n**Reason:** ${reason}`)
                .setTimestamp();

            message.channel.send({ embeds: [embed] });
        } catch (error) {
            message.reply('Failed to lock the channel. Check my permissions.');
        }
    }
};
