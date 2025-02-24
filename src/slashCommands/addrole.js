
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addrole')
        .setDescription('Add a role to a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to add the role to')
                .setRequired(true))
        .addRoleOption(option => 
            option.setName('role')
                .setDescription('The role to add')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const member = interaction.options.getMember('user');
        const role = interaction.options.getRole('role');

        if (!member) {
            return interaction.reply({
                content: 'Could not find that user!',
                ephemeral: true
            });
        }

        if (!role) {
            return interaction.reply({
                content: 'Could not find that role!',
                ephemeral: true
            });
        }

        try {
            await member.roles.add(role);
            await interaction.reply({
                content: `Successfully added ${role} to ${member}`,
                ephemeral: true
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'Failed to add role. Make sure I have the proper permissions and the role is below my highest role.',
                ephemeral: true
            });
        }
    }
};
