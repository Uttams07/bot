const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const User = require('../database/models/user');

module.exports = {
    name: 'afk', // Command name
    description: 'Set or remove your AFK (Away From Keyboard) status', // Command description
    aliases: ['away'], // Command aliases
    category: 'Utility', // Command category
    usage: 'afk / afk <reason>', // Command usage instructions

    async execute(message, args, client) {
        const reason = args.join(' ') || 'AFK';
        const userId = message.author.id;

        // Check if the user is already AFK
        const user = await User.findOne({ userID: userId });
        if (user && user.afk) {
            // Remove AFK status
            await User.findOneAndUpdate({ userID: userId }, { $unset: { afk: '' } });
            const newNickname = message.member.displayName.replace('[AFK] ', '');
            if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames) && message.member.roles.highest.position < message.guild.members.me.roles.highest.position) {
                try {
                    await message.member.setNickname(newNickname);
                } catch (error) {
                    console.error('Failed to change nickname:', error);
                }
            } else {
                message.channel.send("I don't have permission to change your nickname.");
            }
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`${message.author}, welcome back! Your AFK status has been removed.`);
            message.channel.send({ embeds: [embed] });
        } else {
            // Set AFK status
            await User.findOneAndUpdate(
                { userID: userId },
                { $set: { afk: reason } },
                { upsert: true, new: true }
            );
            const newNickname = `[AFK] ${message.member.displayName}`;
            if (message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames) && message.member.roles.highest.position < message.guild.members.me.roles.highest.position) {
                try {
                    await message.member.setNickname(newNickname);
                } catch (error) {
                    console.error('Failed to change nickname:', error);
                }
            } else {
                message.channel.send("I don't have permission to change your nickname.");
            }
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`${message.author} is now AFK: ${reason}`);
            message.channel.send({ embeds: [embed] });
        }
    },
};