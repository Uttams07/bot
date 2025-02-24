
const { EmbedBuilder } = require('discord.js');
const Level = require('../database/schemas/levelSchema');

module.exports = {
    name: 'rank',
    description: 'Display current level and XP',
    aliases: ['level'],
    category: 'Leveling',
    usage: 'rank [@user]',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const levelData = await Level.findOne({ 
            userId: user.id,
            guildId: message.guild.id 
        });

        if (!levelData) {
            return message.reply('This user has no XP yet!');
        }

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Rank`)
            .setColor('#0099ff')
            .addFields(
                { name: 'Level', value: levelData.level.toString(), inline: true },
                { name: 'XP', value: levelData.xp.toString(), inline: true },
                { name: 'Next Level', value: `${(levelData.level + 1) * 100 - levelData.xp} XP needed`, inline: true }
            )
            .setThumbnail(user.displayAvatarURL());

        await message.reply({ embeds: [embed] });
    }
};
