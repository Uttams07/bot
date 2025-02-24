
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Displays information about a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to get information about')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        const joinedAt = Math.floor(member.joinedTimestamp / 1000);
        const createdAt = Math.floor(user.createdTimestamp / 1000);

        const embed = new EmbedBuilder()
            .setTitle(`${user.tag}'s Information`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setColor('#0099ff')
            .addFields(
                { name: 'Joined Server', value: `<t:${joinedAt}:R>`, inline: true },
                { name: 'Account Created', value: `<t:${createdAt}:R>`, inline: true },
                { name: 'Roles', value: member.roles.cache.map(r => r).join(', ') || 'None' }
            )
            .setFooter({ text: `User ID: ${user.id}` });

        await interaction.reply({ embeds: [embed] });
    }
};
