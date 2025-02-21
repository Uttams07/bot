const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'coinflip',
    aliases: ['flip', 'toss', 'cointoss', 'cf'],
    category: 'Fun',
    description: 'Flip a coin for you!',
    example: ['coinflip'], // Example usage
    async execute(message) {
        const coinEmoji = '🪙'; // Define the coin emoji

        // Initial embed to show the coin is flipping
        const initialEmbed = new EmbedBuilder()
            .setTitle(`${coinEmoji} Coinflip ${coinEmoji}`)
            .setDescription(`${message.member} (\`${message.member.user.tag}\`) Flipped a coin...`)
            .setFooter({
                text: message.member.displayName,
                iconURL: message.author.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setColor(message.guild.members.me.displayHexColor);

        // Send the initial embed
        const msg = await message.reply({ embeds: [initialEmbed] });

        // Add a delay of 2 seconds (2000 milliseconds)
        setTimeout(async () => {
            const n = Math.floor(Math.random() * 2);
            const result = n === 1 ? 'Heads' : 'Tails';

            const resultEmbed = new EmbedBuilder()
                .setTitle(`${coinEmoji} Coinflip ${coinEmoji}`)
                .setDescription(`${message.member} (\`${message.member.user.tag}\`) Flipped a coin and got **\`${result}\`**!`)
                .setFooter({
                    text: message.member.displayName,
                    iconURL: message.author.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp()
                .setColor(message.guild.members.me.displayHexColor);

            // Edit the initial message with the result
            await msg.edit({ embeds: [resultEmbed] });
        }, 2000); // 2 seconds delay
    }
};