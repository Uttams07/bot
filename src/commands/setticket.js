
const { EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TicketConfig = require('../database/schemas/ticketConfigSchema');

module.exports = {
    name: 'setticket',
    description: 'Set up the ticket system',
    category: 'Tickets',
    usage: 'setticket <channel> [logchannel]',
    userPermissions: [PermissionFlagsBits.Administrator],
    async execute(message, args) {
        const ticketChannel = message.mentions.channels.first();
        const logChannel = message.mentions.channels.get(1);

        if (!ticketChannel) {
            return message.reply('Please mention a channel for tickets!');
        }

        let config = await TicketConfig.findOne({ guildId: message.guild.id });
        if (!config) {
            config = new TicketConfig({ guildId: message.guild.id });
        }

        config.ticketChannelId = ticketChannel.id;
        if (logChannel) {
            config.ticketLogChannelId = logChannel.id;
        }
        await config.save();

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🎫 Create a Ticket')
            .setDescription('Click the button below to create a ticket')
            .setFooter({ text: 'Support Tickets' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('create_ticket')
                    .setLabel('Create Ticket')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🎫')
            );

        await ticketChannel.send({ embeds: [embed], components: [row] });
        message.reply(`Ticket system has been set up in ${ticketChannel}${logChannel ? ` with logs in ${logChannel}` : ''}`);
    }
};
