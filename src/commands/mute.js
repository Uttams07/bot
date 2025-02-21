const { PermissionsBitField } = require('discord.js');

module.exports = {
    name: 'mute', // Command name
    description: 'Timeout a member for a specified duration', // Command description
    aliases: ['timeout'], // Command aliases
    category: 'Moderation', // Command category
    usage: 'mute @user 2h / mute @user 1min / mute @user 1h', // Command usage instructions
    async execute(message, args) {
        // Check if the member executing the command has the necessary permission
        if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.channel.send("You don't have permission to use this command.");
        }

        // Check if a member was mentioned
        const target = message.mentions.members.first();
        if (!target) {
            return message.channel.send('Please mention a member to mute.');
        }

        // Check if a duration was specified
        const duration = args[1];
        if (!duration) {
            return message.channel.send('Please specify a duration for the mute.');
        }

        // Convert duration to milliseconds
        const time = parseDuration(duration);
        if (!time) {
            return message.channel.send('Invalid duration format. Use `1h`, `30m`, `1d`, etc.');
        }

        // Check if the bot has the necessary permission
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
            return message.channel.send("I don't have permission to timeout members.");
        }

        // Check if the bot's role is higher than the target's role
        if (message.guild.members.me.roles.highest.position <= target.roles.highest.position) {
            return message.channel.send('My role must be higher than the member\'s role to timeout them.');
        }

        try {
            // Timeout the member
            await target.timeout(time, `Muted by ${message.author.tag} for ${duration}`);
            message.channel.send(`${target.user.tag} has been muted for ${duration}.`);
        } catch (error) {
            console.error('Failed to mute member:', error);
            message.channel.send(`Failed to mute ${target.user.tag}.`);
        }
    },
};

// Function to parse the duration string
function parseDuration(duration) {
    const timeUnit = duration.slice(-1).toLowerCase();
    const timeValue = parseInt(duration.slice(0, -1));
    if (isNaN(timeValue)) {
        return null;
    }

    switch (timeUnit) {
        case 's': // Seconds
            return timeValue * 1000;
        case 'm': // Minutes
            return timeValue * 60 * 1000;
        case 'h': // Hours
            return timeValue * 60 * 60 * 1000;
        case 'd': // Days
            return timeValue * 24 * 60 * 60 * 1000;
        default:
            return null;
    }
}
