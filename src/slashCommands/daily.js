
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Economy = require('../database/models/economy');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Collect your daily reward'),

    async execute(interaction) {
        try {
            let userEconomy = await Economy.findOne({ userId: interaction.user.id });
            if (!userEconomy) {
                userEconomy = await Economy.create({ userId: interaction.user.id, wallet: 0, bank: 0 });
            }

            const cooldown = 24 * 60 * 60 * 1000; // 24 hours
            if (userEconomy.lastDaily && (Date.now() - userEconomy.lastDaily.getTime() < cooldown)) {
                const timeLeft = ms(cooldown - (Date.now() - userEconomy.lastDaily.getTime()));
                return interaction.reply({ content: `You can collect your daily reward again in ${timeLeft}`, ephemeral: true });
            }

            const reward = 100;
            userEconomy.wallet += reward;
            userEconomy.lastDaily = new Date();
            await userEconomy.save();

            const embed = new EmbedBuilder()
                .setTitle('Daily Reward')
                .setDescription(`You received ${reward} coins!`)
                .setColor('#00FF00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Error collecting daily reward!', ephemeral: true });
        }
    }
};
