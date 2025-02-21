const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'kick',
    description: 'Permanently kicks a user from the server',
    aliases: ['kickuser'],
    category: 'User Moderation',
    usage: '<@user|userid|username>',
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return message.channel.send('You do not have permission to kick members.');
        }

        if (!args[0]) {
            return message.channel.send('Please provide a user mention or ID to kick.');
        }

        // Get the member to kick
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // If member is not found, return
        if (!member) {
            return message.channel.send('User  not found.');
        }

        // Check if the target user has roles higher or equal to the command issuer
        if (message.member.roles.highest.position <= member.roles.highest.position) {
            return message.channel.send('You cannot kick this user because their highest role is equal to or higher than yours.');
        }

        // Permanently kick the user
        try {
            await member.kick(`Kicked by ${message.author.tag}`);

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('User  Kicked')
                .setDescription(`Successfully kicked ${member.user.tag} from the server.`)
                .addFields(
                    { name: 'User ', value: `${member.user.tag}`, inline: true },
                    { name: 'Kicked by', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

            // Log the action to the mod log channel if needed
            const guildData = await Guild.findOne({ guildId: message.guild.id });
            if (guildData && guildData.modLogChannelID) {
                const modLogChannel = message.guild.channels.cache.get(guildData.modLogChannelID);
                if (modLogChannel) {
                    modLogChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Error kicking user:', error);
            message.channel.send('There was an error trying to kick the user.');
        }
    },
};