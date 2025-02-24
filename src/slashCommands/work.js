
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Economy = require('../database/models/economy');
const ms = require('ms');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work to earn some coins'),

    async execute(interaction) {
        try {
            let userEconomy = await Economy.findOne({ userId: interaction.user.id });
            if (!userEconomy) {
                userEconomy = await Economy.create({ userId: interaction.user.id, wallet: 0, bank: 0 });
            }

            const cooldown = 30 * 60 * 1000; // 30 minutes
            if (userEconomy.lastWork && (Date.now() - userEconomy.lastWork.getTime() < cooldown)) {
                const timeLeft = ms(cooldown - (Date.now() - userEconomy.lastWork.getTime()));
                return interaction.reply({ content: `You can work again in ${timeLeft}`, ephemeral: true });
            }

            const jobs = [
                'Programmer', 'Chef', 'Artist', 'Writer', 'Teacher',
                'Doctor', 'Mechanic', 'Gardener', 'Scientist', 'Musician'
            ];
            
            const earnings = Math.floor(Math.random() * 91) + 10; // 10-100 coins
            const job = jobs[Math.floor(Math.random() * jobs.length)];

            userEconomy.wallet += earnings;
            userEconomy.lastWork = new Date();
            await userEconomy.save();

            const embed = new EmbedBuilder()
                .setTitle('Work Complete!')
                .setDescription(`You worked as a ${job} and earned ${earnings} coins!`)
                .setColor('#00FF00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Error while working!', ephemeral: true });
        }
    }
};
