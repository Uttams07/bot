
const { EmbedBuilder } = require('discord.js');
const Ticket = require('../database/schemas/ticketSchema');
const TicketConfig = require('../database/schemas/ticketConfigSchema');

module.exports = {
    name: 'closeticket',
    description: 'Close a ticket',
    category: 'Tickets',
    usage: 'closeticket [reason]',
    async execute(message, args) {
        const ticket = await Ticket.findOne({ channelId: message.channel.id, status: 'open' });
        if (!ticket) {
            return message.reply('This is not a ticket channel or the ticket is already closed.');
        }

        const reason = args.join(' ') || 'No reason provided';
        ticket.status = 'closed';
        ticket.closedAt = new Date();
        ticket.closedBy = message.author.id;
        await ticket.save();

        const config = await TicketConfig.findOne({ guildId: message.guild.id });
        if (config?.ticketLogChannelId) {
            const logChannel = message.guild.channels.cache.get(config.ticketLogChannelId);
            if (logChannel) {
                const logEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle(`Ticket #${ticket.ticketNumber} Closed`)
                    .addFields(
                        { name: 'Closed by', value: message.author.tag },
                        { name: 'Reason', value: reason },
                        { name: 'Duration', value: `${Math.floor((ticket.closedAt - ticket.createdAt) / 1000 / 60)} minutes` }
                    )
                    .setTimestamp();
                await logChannel.send({ embeds: [logEmbed] });
            }
        }

        await message.channel.delete();
    }
};
