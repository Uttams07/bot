const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const ms = require('ms');

module.exports = {
    name: 'write',
    description: 'Temporarily gives a user permission to write in the current channel for a specified duration',
    aliases: ['wh', 'writehere'],
    category: 'Moderation',
    usage: 'write <@user|userid|username> <duration>',
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
            return message.channel.send('You do not have permission to manage channels.');
        }

        if (args.length < 2) {
            return message.channel.send('Please provide a user mention or ID and a duration.');
        }

        // Get the member to whitelist
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);

        // If member is not found, return
        if (!member) {
            return message.channel.send('User not found.');
        }

        const duration = args[1];
        const whitelistDuration = ms(duration);

        if (!whitelistDuration) {
            return message.channel.send('Invalid duration. Please provide a valid duration (e.g., 10s, 10m, 10h, 10d, 10mn).');
        }

        // Check if the user already has the permission
        if (message.channel.permissionsFor(member).has(PermissionsBitField.Flags.SendMessages)) {
            try {
                await message.channel.permissionOverwrites.edit(member, { SendMessages: false });

                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(`Removed write permission for ${member.user.tag}.`)
                    .setTimestamp();

                message.channel.send({ embeds: [embed] });
            } catch (error) {
                console.error('Error removing permission:', error);
                message.channel.send('There was an error trying to remove the permission.');
            }
        } else {
            // Grant the permission and set a timeout to remove it after the specified duration
            try {
                await message.channel.permissionOverwrites.edit(member, { SendMessages: true });

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setDescription(`Granted write permission to ${member.user.tag} for ${duration}.`)
                    .setTimestamp();

                message.channel.send({ embeds: [embed] });

                // Remove the permission after the specified duration
                setTimeout(async () => {
                    if (message.channel.permissionsFor(member).has(PermissionsBitField.Flags.SendMessages)) {
                        try {
                            await message.channel.permissionOverwrites.edit(member, { SendMessages: false });

                            const removalEmbed = new EmbedBuilder()
                                .setColor('#ff0000')
                                .setDescription(`Write permission for ${member.user.tag} automatically removed.`)
                                .setTimestamp();

                            message.channel.send({ embeds: [removalEmbed] });
                        } catch (error) {
                            console.error('Error removing permission:', error);
                        }
                    }
                }, whitelistDuration);
            } catch (error) {
                console.error('Error granting permission:', error);
                message.channel.send('There was an error trying to grant the permission.');
            }
        }
    },
};
