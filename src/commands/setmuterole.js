const Guild = require('../database/models/guild');
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'setmuterole',
    description: 'Sets the mute role for the server',
    aliases: ['smr'], // Command aliases
    category: 'Configuration', // Command category
    usage: 'setmuterole @role/Role_Id', // Command usage instructions
    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.channel.send('You do not have permission to set the mute role.');
        }

        if (!args[0]) {
            return message.channel.send('Please provide a role mention, name, or ID.');
        }

        // Get the role from the mention, role ID, or role name
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) ||
            message.guild.roles.cache.find(r => r.name.toLowerCase().includes(args[0].toLowerCase()));

        // If role is not found, return
        if (!role) {
            return message.channel.send('Role not found.');
        }

        const guildId = message.guild.id;

        // Update or create the guild's mute role in the database
        await Guild.findOneAndUpdate(
            { guildID: guildId },
            { muteRoleID: role.id },
            { upsert: true, new: true }
        );

        // Update the cached mute role
        const guildData = await Guild.findOne({ guildID: guildId });
        message.client.guildCache.set(guildId, guildData);

        // Send a confirmation message
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Mute Role Set')
            .setDescription(`Successfully set the mute role to ${role.name}.`)
            .addFields(
                { name: 'Role', value: `${role.name}`, inline: true },
                { name: 'Set by', value: `${message.author.tag}`, inline: true }
            )
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    },
};
