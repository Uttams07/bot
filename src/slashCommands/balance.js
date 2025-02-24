
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Economy = require('../database/models/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your or another user\'s balance')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to check balance for (optional)')),

    async execute(interaction) {
        const target = interaction.options.getUser('user') || interaction.user;
        
        try {
            let userEconomy = await Economy.findOne({ userId: target.id });
            if (!userEconomy) {
                userEconomy = await Economy.create({ userId: target.id, wallet: 0, bank: 0 });
            }

            const embed = new EmbedBuilder()
                .setTitle(`${target.username}'s Balance`)
                .setColor('#00FF00')
                .addFields(
                    { name: 'Wallet', value: `${userEconomy.wallet} coins`, inline: true },
                    { name: 'Bank', value: `${userEconomy.bank} coins`, inline: true }
                )
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Error checking balance!', ephemeral: true });
        }
    }
};
