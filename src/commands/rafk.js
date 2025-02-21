const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'removeafk', // Command name
    description: 'Removes [AFK] from everyone\'s nickname and renames them to their original name.', // Command description
    aliases: ['rafk'], // Command aliases
    category: 'Moderation', // Command category
    usage: 'removeafk', // Command usage instructions
    async execute(message, args) {
        // Check if the user has permission to manage nicknames
        if (!message.member.permissions.has('MANAGE_NICKNAMES')) {
            return message.reply('🚫 You do not have permission to manage nicknames.');
        }

        // Fetch all members of the guild
        const members = await message.guild.members.fetch();

        // Counter for successful renames
        let renamedCount = 0;

        // Iterate through each member
        members.forEach(member => {
            if (member.manageable && member.nickname && member.nickname.startsWith('[AFK]')) {
                // Remove [AFK] from the nickname
                const newNickname = member.nickname.replace(/^\[AFK\]\s*/, '');

                // Set the new nickname
                member.setNickname(newNickname)
                    .then(() => {
                        renamedCount++;
                        console.log(`Renamed ${member.user.tag} to ${newNickname}`);
                    })
                    .catch(err => {
                        console.error(`Failed to rename ${member.user.tag}:`, err);
                    });
            }
        });

        // Send a confirmation message
        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`✅ Successfully removed [AFK] from ${renamedCount} members.`);

        message.channel.send({ embeds: [embed] });
    },
};