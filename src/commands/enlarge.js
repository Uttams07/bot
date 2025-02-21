const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: "enlarge", // Command name
    aliases: [], // Command aliases
    category: "Utility", // Command category
    description: "Enlarges the provided emoji !!", // Command description
    usage: "[emoji]", // Command usage instructions
    examples: [`enlarge [emoji]`], // Command examples
    async execute(message, args) {
        const emoji = args[0];
        if (!emoji) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription(`❌ Please provide an emoji to enlarge!`)
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            return message.channel.send({ embeds: [embed] });
        }

        // Check if the emoji is a custom Discord emoji
        const customEmojiRegex = /<a?:\w+:(\d+)>/; // Matches both animated and static custom emojis
        const match = emoji.match(customEmojiRegex);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`Here is your enlarged emoji:`)
            .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
            .setTimestamp();

        if (match) {
            // Custom emoji found
            const emojiId = match[1];
            const isAnimated = emoji.startsWith('<a:');
            embed.setImage(`https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}?size=2048`);
        } else {
            // Handle standard emojis (Unicode)
            embed.setImage(`https://twemoji.maxcdn.com/v/latest/72x72/${encodeURIComponent(emoji)}.png`);
        }

        return message.channel.send({ embeds: [embed] });
    }
}