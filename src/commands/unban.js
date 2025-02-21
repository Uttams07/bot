const Guild = require('../database/models/guild');
const User = require('../database/models/user');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'unban',
    description: 'Unbans a user',
    aliases: ['unbanuser'],
    category: 'UserModeration',
    usage: '<userID|username>',
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.channel.send('You do not have permission to unban members.');
        }

        if (!args[0]) {
            return message.channel.send('Please provide a user ID or username to unban.');
        }

        const userArg = args.join(' ');
        let bannedUser;

        try {
            // Fetch the ban list
            const bans = await message.guild.bans.fetch();
            // Find by user ID or username#discriminator
            bannedUser = bans.find(ban => 
                ban.user.id === userArg || ban.user.tag === userArg
            )?.user;

            if (!bannedUser) {
                return message.channel.send('User is not banned or could not be found in the ban list.');
            }
        } catch (error) {
            console.error('Error fetching bans:', error);
            return message.channel.send('There was an error fetching the ban list.');
        }

        const guildId = message.guild.id;
        const guildData = await Guild.findOne({ guildID: guildId });

        try {
            // Unban the user
            await message.guild.members.unban(bannedUser);

            // Update user data
            let user = await User.findOne({ userID: bannedUser.id });
            if (user) {
                user.banEnd = Date.now();
                await user.save();
            }

            // Remove from guild's bannedUsers array
            if (guildData.bannedUsers.some(u => u.userID === bannedUser.id)) {
                guildData.bannedUsers = guildData.bannedUsers.filter(
                    u => u.userID !== bannedUser.id
                );
                await guildData.save();
            }

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('User Unbanned')
                .setDescription(`Successfully unbanned ${bannedUser.tag}.`)
                .addFields(
                    { name: 'User', value: `${bannedUser.tag}`, inline: true },
                    { name: 'Unbanned by', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

            // Log to mod log channel
            if (guildData.modLogChannelID) {
                const modLogChannel = message.guild.channels.cache.get(guildData.modLogChannelID);
                if (modLogChannel) {
                    modLogChannel.send({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Error unbanning user:', error);
            message.channel.send('There was an error trying to unban the user.');
        }
    },
};