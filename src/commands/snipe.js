const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'snipe',
    description: 'Retrieves the latest deleted text message!',
    aliases: [], // Command aliases
    category: 'Fun', // Command category
    usage: 'snipe', // Command usage instructions

    async execute(message, args) {
        try {
            // Retrieve the sniped message
            const msg = message.client.snipes.get(message.channel.id);

            // Check if a message was actually sniped
            if (!msg) {
                return message.reply('🚫 No recently deleted message found!');
            }

            // Create the embed
            const embed = new EmbedBuilder()
                .setTitle('💀 Sniped Message!')
                .setAuthor({
                    name: msg.author.tag || 'Unknown User',
                    iconURL: msg.author.avatar || null
                })
                .addFields(
                    { name: '📝 Content', value: msg.content || 'No content' },
                    { name: '👤 Author', value: `<@${msg.author.id}> (\`${msg.author.tag || 'Unknown'}\`)` }
                )
                .setFooter({
                    text: `Requested by ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL({ dynamic: true }) || null
                })
                .setTimestamp(msg.timestamp || Date.now())
                .setColor('#2F3136');

            // Send the embed response
            await message.reply({ embeds: [embed] });

        } catch (err) {
            console.error('❌ Error while handling the snipe command:', err);
            await message.reply('🚫 An error occurred while trying to snipe the message!');
        }
    }
};