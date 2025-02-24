
const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timer')
        .setDescription('Sets a timer')
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the timer (e.g., 1h, 30m)')
                .setRequired(true)),
    async execute(interaction) {
        const duration = interaction.options.getString('duration');
        const msTime = ms(duration);

        if (!msTime) {
            return interaction.reply({ content: 'Please provide a valid duration format (e.g., 1h, 30m, 1d)', ephemeral: true });
        }

        await interaction.reply(`Timer set for ${duration}`);

        setTimeout(async () => {
            await interaction.followUp(`⏰ Time's up! Your ${duration} timer has finished.`);
        }, msTime);
    }
};
