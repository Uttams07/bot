const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Guild = require('../database/models/guild');
const User = require('../database/models/user');
const ms = require('ms');

module.exports = {
    name: 'warn',
    description: 'Warns a user and applies actions based on the number of warnings, 3 warn= 24h mute, 10 warn= 7d mute, 20 warn= ban',
    aliases: ['warnuser'],
    category: 'Moderation',
    usage: 'warn <@user|userid|username> [reason]',
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.channel.send('You do not have permission to warn members.');
        }

        if (!args[0]) {
            return message.channel.send('Please provide a user mention or ID to warn.');
        }

        // Get the member to warn
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // If member is not found, return
        if (!member) {
            return message.channel.send('User  not found.');
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';
        const guildId = message.guild.id;
        const guildData = await Guild.findOne({ guildID: guildId });
        const userId = member.id;

        // Get the user's data from the database
        let user = await User.findOne({ userID: userId });
        if (!user) {
            user = new User({ userID: userId });
        }

        user.warnings += 1;
        await user.save();

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('User  Warned')
            .setDescription(`${member.user.tag} has been warned.`)
            .addFields(
                { name: 'User ', value: `${member.user.tag}`, inline: true },
                { name: 'Warned by', value: `${message.author.tag}`, inline: true },
                { name: 'Reason', value: `${reason}`, inline: true },
                { name: 'Warnings', value: `${user.warnings}`, inline: true }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });

        // Log the action to the mod log channel
        if (guildData && guildData.modLogChannelID) {
            const modLogChannel = message.guild.channels.cache.get(guildData.modLogChannelID);
            if (modLogChannel) {
                modLogChannel .send({ embeds: [embed] });
            }
        }

        // Apply actions based on the number of warnings
        const muteRole = guildData && guildData.muteRoleID ? message.guild.roles.cache.get(guildData.muteRoleID) : null;

        if (user.warnings >= 3 && user.warnings < 10) {
            // Mute the user for 24 hours
            if (muteRole) {
                await member.roles.add(muteRole);
                user.muteEnd = new Date(Date.now() + ms('24h'));
                await user.save();

                const muteEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`Muted ${member.user.tag} for 24 hours due to receiving 3 or more warnings.`)
                    .setTimestamp();

                message.channel.send({ embeds: [muteEmbed] });
                if (modLogChannel) {
                    modLogChannel.send({ embeds: [muteEmbed] });
                }

                // Unmute after 24 hours
                setTimeout(async () => {
                    await member.roles.remove(muteRole);
                    user.muteEnd = null;
                    await user.save();

                    const unmuteEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setDescription(`${member.user.tag} has been automatically unmuted after 24 hours.`)
                        .setTimestamp();

                    message.channel.send({ embeds: [unmuteEmbed] });
                    if (modLogChannel) {
                        modLogChannel.send({ embeds: [unmuteEmbed] });
                    }
                }, ms('24h'));
            }
        } else if (user.warnings >= 10 && user.warnings < 20) {
            // Mute the user for 7 days
            if (muteRole) {
                await member.roles.add(muteRole);
                user.muteEnd = new Date(Date.now() + ms('7d'));
                await user.save();

                const muteEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`Muted ${member.user.tag} for 7 days due to receiving 10 or more warnings.`)
                    .setTimestamp();

                message.channel.send({ embeds: [muteEmbed] });
                if (modLogChannel) {
                    modLogChannel.send({ embeds: [muteEmbed] });
                }

                // Unmute after 7 days
                setTimeout(async () => {
                    await member.roles.remove(muteRole);
                    user.muteEnd = null;
                    await user.save();

                    const unmuteEmbed = new EmbedBuilder()
                        .setColor('#00FF00')
                        .setDescription(`${member.user.tag} has been automatically unmuted after 7 days.`)
                        .setTimestamp();

                    message.channel.send({ embeds: [unmuteEmbed] });
                    if (modLogChannel) {
                        modLogChannel.send({ embeds: [unmuteEmbed] });
                    }
                }, ms('7d'));
            }
        } else if (user.warnings >= 20) {
            // Ban the user permanently
            try {
                await member.ban({ reason: `Banned by ${message.author.tag} after receiving 20 warnings.` });
                user.banEnd = null; // No expiration for permanent bans
                await user.save();

                const banEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`Banned ${member.user.tag} permanently due to receiving 20 or more warnings.`)
                    .setTimestamp();

                message.channel.send({ embeds: [banEmbed] });
                if (modLogChannel) {
                    modLogChannel.send({ embeds: [banEmbed] });
                }
            } catch (error) {
                console.error('Failed to ban user:', error);
                message.channel.send('There was an error trying to ban the user.');
            }
        }
    },
};