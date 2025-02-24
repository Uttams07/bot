
const { EmbedBuilder } = require('discord.js');
const Level = require('../database/schemas/levelSchema');

module.exports = {
    name: 'leaderboard',
    description: 'Show server XP leaderboard',
    aliases: ['lb'],
    category: 'Leveling',
    usage: 'leaderboard',
    async execute(message) {
        const leaderboard = await Level.find({ guildId: message.guild.id })
            .sort({ xp: -1 })
            .limit(10);

        if (!leaderboard.length) {
            return message.reply('No one has earned XP yet!');
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 XP Leaderboard')
            .setColor('#FFD700')
            .setDescription(
                await Promise.all(leaderboard.map(async (data, index) => {
                    const user = await message.client.users.fetch(data.userId);
                    return `${index + 1}. ${user.tag} - Level ${data.level} (${data.xp} XP)`;
                }))
            );

        await message.reply({ embeds: [embed] });
    }
};
