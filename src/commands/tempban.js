const Guild = require('../database/models/guild');
const User = require('../database/models/user');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'tempban',
    description: 'Bans a user for a specified duration',
    aliases: ['tempban'],
    category: 'Moderation',
    usage: '<user> <duration>',
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return message.channel.send('You do not have permission to ban members.');
        }

        if (args.length < 2) {
            return message.channel.send('Please provide a user mention or ID and a duration to ban.');
        }

        // Get the member to ban
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // If member is not found, return
        if (!member) {
            return message.channel.send('User not found.');
        }

        const duration = args[1];
        const banDuration = ms(duration);

        if (!banDuration) {
            return message.channel.send('Invalid duration. Please provide a valid duration (e.g., 10s, 10m, 10h, 10d, 10mn).');
        }

        const banEnd = new Date(Date.now() + banDuration);

        const guildId = message.guild.id;
        const guildData = await Guild.findOne({ guildID: guildId });

        // Check if the target user has roles higher or equal to the command issuer
        if (message.member.roles.highest.position <= member.roles.highest.position) {
            return message.channel.send('You cannot ban this user because their highest role is equal to or higher than yours.');
        }

        // Ban the user and set ban end time in the database
        try {
            await member.ban({ reason: `Banned by ${message.author.tag} for ${duration}` });

            let user = await User.findOne({ userID: member.id });
            if (!user) {
                user = new User({ userID: member.id });
            }
            user.banEnd = banEnd;
            await user.save();

            const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('User Banned')
                .setDescription(`Successfully banned ${member.user.tag} for ${duration}.`)
                .addFields(
                    { name: 'User', value: `${member.user.tag}`, inline: true },
                    { name: 'Banned by', value: `${message.author.tag}`, inline: true },
                    { name: 'Duration', value: `${duration}`, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

            // Log the action to the mod log channel
            if (guildData && guildData.modLogChannelID) {
                const modLogChannel = message.guild.channels.cache.get(guildData.modLogChannelID);
                if (modLogChannel) {
                    modLogChannel.send({ embeds: [embed] });
                }
            }

            // Unban the user after the specified duration
            setTimeout(async () => {
                try {
                    await message.guild.members.unban(member.id);
                    user.banEnd = null;
                    await user.save();

                    const unbanEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setTitle('User Unbanned')
                        .setDescription(`${member.user.tag} has been automatically unbanned.`)
                        .addFields(
                            { name: 'User', value: `${member.user.tag}`, inline: true },
                            { name: 'Banned by', value: `${message.author.tag}`, inline: true }
                        )
                        .setTimestamp();

                    message.channel.send({ embeds: [unbanEmbed] });

                    if (modLogChannel) {
                        modLogChannel.send({ embeds: [unbanEmbed] });
                    }
                } catch (error) {
                    console.error('Error unbanning user:', error);
                }
            }, banDuration);
        } catch (error) {
            console.error('Error banning user:', error);
            message.channel.send('There was an error trying to ban the user.');
        }
    },
};
