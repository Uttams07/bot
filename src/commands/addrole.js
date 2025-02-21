const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'add', // Command name
    description: 'Adds a role to a user', // Command description
    aliases: ['roleadd', 'giverole'], // Command aliases
    category: 'Moderation', // Command category
    usage: '!add role @user', // Command usage instructions

    async execute(message, args) {
        // Check if the user has the necessary permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return message.reply('You do not have permission to manage roles.');
        }

        if (args.length < 2) {
            return message.reply('Please provide a role and a user to add the role to.');
        }

        // Get the role from the mention or the role ID
        let role = message.mentions.roles.first() || message.guild.roles.cache.get(args[0]) ||
            message.guild.roles.cache.find(r => r.name.toLowerCase().includes(args[0].toLowerCase()));

        // If role is not found, return
        if (!role) {
            return message.reply('Role not found.');
        }

        // Get the member from the mention or the user ID
        let member = message.mentions.members.first() || message.guild.members.cache.get(args[1]) ||
            message.guild.members.cache.find(m => m.user.tag.toLowerCase().includes(args[1].toLowerCase()));

        // If member is not found, return
        if (!member) {
            return message.reply('User  not found.');
        }

        // Check if the target user has roles higher or equal to the command issuer
        if (message.member.roles.highest.position <= member.roles.highest.position) {
            return message.reply('You cannot assign roles to this user because their highest role is equal to or higher than yours.');
        }

        // Add the role to the user
        try {
            await member.roles.add(role);

            // Send a confirmation message
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Role Added')
                .setDescription(`Successfully added the role ${role.name} to ${member.user.tag}.`)
                .addFields(
                    { name: 'Role', value: `${role.name}`, inline: true },
                    { name: 'User ', value: `${member.user.tag}`, inline: true },
                    { name: 'Assigned by', value: `${message.author.tag}`, inline: true }
                )
                .setTimestamp();

            message.channel.send({ embeds: [embed] });

            // Log the action in the console or a dedicated log channel
            console.log(`Role ${role.name} added to ${member.user.tag} by ${message.author.tag}`);

        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to add the role to the user.');
        }
    },
};