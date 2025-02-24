
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'userinfo',
    description: 'Displays information about a user',
    aliases: ['user', 'whois'],
    category: 'Information',
    usage: 'userinfo [@user]',
    async execute(message, args) {
        const user = message.mentions.users.first() || message.author;
        const member = await message.guild.members.fetch(user.id);
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

        await message.reply({ embeds: [embed] });
    }
};
