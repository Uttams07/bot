const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ping', // Command name
    description: 'Responds with Pong! and measures response time.', // Command description
    aliases: ['p'], // Command aliases
    category: 'Utility', // Command category
    usage: 'ping', // Command usage instructions
    async execute(message, args) {
        // Start measuring time
        const start = Date.now();
        
        // Create an embed message
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Ping Command')
            .setDescription('Calculating response time...')
            .setTimestamp();

        // Send the initial embed message
        const responseMessage = await message.channel.send({ embeds: [embed] });

        // Calculate the response time
        const latency = Date.now() - start;

        // Update the embed with the response time
        embed.setDescription(`Pong! 🏓\nResponse time: **${latency}ms**`)
             .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
             .setTimestamp();

        // Edit the original message with the updated embed
        await responseMessage.edit({ embeds: [embed] });
    }
};