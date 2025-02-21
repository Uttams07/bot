const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'unmute', // Command name
    description: 'Remove the timeout from a member', // Command description
    aliases: [], // Command aliases
    category: 'Moderation', // Command category
    usage: 'unmute @user', // Command usage instructions
    async execute(message, args) {
        // Check if the member executing the command has the necessary permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.channel.send("You don't have permission to use this command.");
        }

        // Check if a member was mentioned
        const target = message.mentions.members.first();
        if (!target) {
            return message.channel.send('Please mention a member to unmute.');
        }

        // Check if the bot has the necessary permission
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.channel.send("I don't have permission to remove timeouts.");
        }

        // Check if the bot's role is higher than the target's role
        if (message.guild.members.me.roles.highest.position <= target.roles.highest.position) {
            return message.channel.send('My role must be higher than the member\'s role to remove their timeout.');
        }

        try {
            // Remove the timeout
            await target.timeout(null, `Unmuted by ${message.author.tag}`);
            message.channel.send(`${target.user.tag} has been unmuted.`);
        } catch (error) {
            console.error('Failed to unmute member:', error);
            message.channel.send(`Failed to unmute ${target.user.tag}.`);
        }
    },
};
