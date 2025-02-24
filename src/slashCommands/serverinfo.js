
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays information about the server'),
    async execute(interaction) {
        const guild = interaction.guild;
        const totalMembers = guild.memberCount;
        const createdAt = Math.floor(guild.createdTimestamp / 1000);
        
        const embed = new EmbedBuilder()
            .setTitle(`${guild.name} Server Information`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .setColor('#0099ff')
            .addFields(
                { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
                { name: 'Created At', value: `<t:${createdAt}:R>`, inline: true },
                { name: 'Members', value: `${totalMembers}`, inline: true },
                { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
                { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
                { name: 'Boost Level', value: `${guild.premiumTier}`, inline: true }
            )
            .setFooter({ text: `Server ID: ${guild.id}` });

        await interaction.reply({ embeds: [embed] });
    }
};
