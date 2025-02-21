/*const { Events, EmbedBuilder } = require('discord.js');
const moment = require('moment');
const Guild = require('../database/models/guild');

module.exports = (client) => {
    client.on(Events.GuildMemberAdd, async member => {
        const guildId = member.guild.id;
        const guildData = await Guild.findOne({ guildID: guildId });

        if (!guildData || !guildData.welcomeChannelID) {
            return;
        }

        const channel = member.guild.channels.cache.get(guildData.welcomeChannelID);

        if (!channel) return;

        // Fetch the member count
        const memberCount = member.guild.memberCount;

        // Send a welcome message mentioning the user
        //channel.send(`Welcome ${member}!`);

        // Create the embed message
        const embed = new EmbedBuilder()
            .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
            .setTitle('<a:whitearrow:1324950272719454268> Wlcm to Love Cafe™')
            .setColor('#0099ff')
            .setDescription(`<a:1Love:1324992461235552319>" stay & enjou qt ױ\n⋆｡°★[Chat](https://discord.com/channels/${member.guild.id}/1329536989309177937)\n⋆｡°★[Rules](https://discord.com/channels/https://discord.com/channels/${member.guild.id}/1329536989309177937)`)
            .setThumbnail(member.user.displayAvatarURL())
            .setFooter({ text: `we now have ${memberCount} members`})
            .setTimestamp();

        // Send the embed message
        //channel.send({ embeds: [embed] });
    });
}; */

const moment = require('moment');
const { Events, EmbedBuilder } = require('discord.js');
const Guild = require('../database/models/guild');

module.exports = (client) => {
    client.on(Events.GuildMemberAdd, async (member) => {
        const guildId = member.guild.id;
        const guildData = await Guild.findOne({ guildID: guildId });

        if (!guildData || !guildData.welcomeChannelID) {
            return;
        }

        const channel = member.guild.channels.cache.get(guildData.welcomeChannelID);
const memberCount = member.guild.memberCount;

const embed = new EmbedBuilder()
    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
    .setTitle('<a:whitearrow:1324950272719454268> Welcome to Love Cafe™')
    .setColor('#0099ff')
    .setDescription(`<a:1Love:1324992461235552319> Stay & enjoy qt ױ\n⋆｡°★[Chat](https://discord.com/channels/${member.guild.id}/1329536989309177937)\n⋆｡°★[Rules](https://discord.com/channels/${member.guild.id}/1329536989309177937)`)
    .setThumbnail(member.user.displayAvatarURL())
    .setFooter({ text: `We now have ${memberCount} members!` })
    .setTimestamp();

// Check if both content and embed are defined
if (channel) {
    try {
        await channel.send({
            content: `Welcome to the server, ${member.user}! 🎉`,  // Regular text message
            embeds: [embed] // Attach the embed
        }) ;
    } catch (error) {
        console.error("Error sending message:", error);
    }
} else {
    console.log("Channel not found.");
}




        // Ping the new member in all configured channels
        if (guildData.greetPingChannels) {
            for (const channelId of guildData.greetPingChannels) {
                const greetChannel = member.guild.channels.cache.get(channelId);
                if (greetChannel) {
                    const greetMessage = await greetChannel.send(`Welcome <@${member.id}>!`);
                    setTimeout(() => greetMessage.delete(), 5000);
                }
            }
        }
    });
};
