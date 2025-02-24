
const { SlashCommandBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('Sets a reminder')
        .addStringOption(option =>
            option.setName('time')
                .setDescription('Time until reminder (e.g., 1h, 30m)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('What to remind you about')
                .setRequired(true)),
    async execute(interaction) {
        const time = interaction.options.getString('time');
        const message = interaction.options.getString('message');
        
        const msTime = ms(time);
        if (!msTime) {
            return interaction.reply({ content: 'Please provide a valid time format (e.g., 1h, 30m, 1d)', ephemeral: true });
        }

        await interaction.reply(`I will remind you about "${message}" in ${time}`);

        setTimeout(async () => {
            await interaction.user.send(`Reminder: ${message}`);
        }, msTime);
    }
};
