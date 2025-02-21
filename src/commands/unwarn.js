const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const Guild = require('../database/models/guild');
const User = require('../database/models/user');

module.exports = {
    name: 'unwarn',
    description: 'Removes one warning from a user.',
    aliases: ['removewarn'],
    category: 'Moderation',
    usage: 'unwarn <@user|userid|username>',
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.channel.send('You do not have permission to remove warnings from members.');
        }

        if (!args[0]) {
            return message.channel.send('Please provide a user mention or ID to remove a warning.');
        }

        // Get the member to unwarn
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // If member is not found, return
        if (!member) {
            return message.channel.send('User not found.');
        }

        const guildId = message.guild.id;
        const guildData = await Guild.findOne({ guildID: guildId });
        const userId = member.id;

        // Get the user's data from the database
        let user = await User.findOne({ userID: userId });
        if (!user) {
            user = new User({ userID: userId });
        }

        // Check if the user has warnings to remove
        if (user.warnings <= 0) {
            return message.channel.send(`${member.user.tag} has no warnings to remove.`);
        }

        user.warnings -= 1;
        await user.save();

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Warning Removed')
            .setDescription(`${member.user.tag} has had one warning removed.`)
            .addFields(
                { name: 'User', value: `${member.user.tag}`, inline: true },
                { name: 'Unwarned by', value: `${message.author.tag}`, inline: true },
                { name: 'Warnings Left', value: `${user.warnings}`, inline: true }
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
    },
};
