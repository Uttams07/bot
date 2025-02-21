const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: 'avatar', // Command name
    description: 'Shows the avatar of a user or your own avatar.', // Command description
    aliases: ['av', 'photo'], // Command aliases
    category: 'Utility', // Command category
    usage: 'avatar [mention | ID | username | nickname] (optional)', // Command usage instructions
    async execute(message, args) {
        try {
            // Get the member from the mention, ID, or fallback to the message author
            let member = message.mentions.members.first() || 
                         message.guild.members.cache.get(args[0]) || 
                         message.guild.members.cache.find(m => m.user.username === args[0] || m.nickname === args[0]) || 
                         message.member;

            if (!member) return message.reply('**Member Not Found!**');

            // Create the embed message
            const embed = new EmbedBuilder()
                .setTitle(`${member.user.username}'s Avatar`)
                .setColor('#00ffff')
                .setImage(member.user.displayAvatarURL({ dynamic: true, size: 4096 }))
                .setTimestamp()
                .setFooter({
                    text: 'Avatar',
                    iconURL: message.guild.iconURL({ dynamic: true })
                });

            return message.reply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            return message.reply(`An error occurred: \`${error.message}\`!`);
        }
    },
};