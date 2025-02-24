
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('Set your AFK status')
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for going AFK')
                .setRequired(false)),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || 'AFK';
        
        try {
            // Store AFK status in a database or collection
            // This is a simplified version - you'll need to integrate with your database
            await interaction.reply(`${interaction.user} is now AFK: ${reason}`);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Failed to set AFK status.',
                ephemeral: true
            });
        }
    }
};
