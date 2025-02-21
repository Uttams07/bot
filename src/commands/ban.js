const Guild = require('../database/models/guild');
const User = require('../database/models/user');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'ban',
    description: 'Permanently bans a user',
    aliases: ['banuser'],
    category: 'UserModeration',
    usage: '<@user|userid|username>',
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.channel.send('You do not have permission to ban members.');
        }

        if (!args[0]) {
            return message.channel.send('Please provide a user mention or ID to ban.');
        }

        // Get the member to ban
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // If member is not found, return
        if (!member) {
            return message.channel.send('User not found.');
        }

        const guildId = message.guild.id;
        const guildData = await Guild.findOne({ guildID: guildId });

        // Check if the target user has roles higher or equal to the command issuer
        if (message.member.roles.highest.position <= member.roles.highest.position) {
            return message.channel.send('You cannot ban this user because their highest role is equal to or higher than yours.');
        }

        // Permanently ban the user and set ban end time in the database
        try {
            await member.ban({ reason: `Banned by ${message.author.tag}` });

            let user = await User.findOne({ userID: member.id });
            if (!user) {
                user = new User({ userID: member.id });
            }
            user.banEnd = null; // Indicating a permanent ban
            await user.save();

            // Add the banned user to the guild's bannedUsers array
            if (!guildData.bannedUsers.some(u => u.userID === member.id)) {
                guildData.bannedUsers.push({
                    userID: member.id,
                    username: member.user.tag
                });
                await guildData.save();
            }

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('User Banned')
                .setDescription(`Successfully banned ${member.user.tag} permanently.`)
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Banned by', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

            // Log the action to the mod log channel
            if (guildData.modLogChannelID) {
                const modLogChannel = message.guild.channels.cache.get(guildData.modLogChannelID);
                if (modLogChannel) {
                    modLogChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Error banning user:', error);
            message.channel.send('There was an error trying to ban the user.');
        }
    },
};
