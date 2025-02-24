
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const Level = require('../database/schemas/levelSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Display your current level and XP')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('User to check rank for')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const levelData = await Level.findOne({ 
            userId: user.id,
            guildId: interaction.guildId 
        });

        if (!levelData) {
            return interaction.reply('This user has no XP yet!');
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

        await interaction.reply({ embeds: [embed] });
    }
};
