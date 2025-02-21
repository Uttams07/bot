const { SlashCommandBuilder } = require('discord.js'); // Use main library's SlashCommandBuilder
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Checks bot latency and response time'),
    async execute(interaction) {
        // Create initial embed
        const latencyEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🏓 Pong!')
            .setDescription('Measuring response time...')
            .setTimestamp();

        // Send initial response and capture timestamp
        const sentTime = Date.now();
        const response = await interaction.reply({ 
            embeds: [latencyEmbed], 
            fetchReply: true 
        });

        // Calculate various latency metrics
        const botLatency = response.createdTimestamp - interaction.createdTimestamp;
        const apiLatency = Math.round(interaction.client.ws.ping);

        // Update embed with latency information
        latencyEmbed
            .setDescription([
                `**Bot Latency:** ${botLatency}ms`,
                `**API Latency:** ${apiLatency}ms`
            ].join('\n'))
            .setFooter({
                text: `Requested by ${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL()
            });

        // Edit the original response
        await response.edit({ embeds: [latencyEmbed] });
    }
};