const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

const activeGames = new Set(); // To track active games

module.exports = {
    name: 'rps',
    description: 'Play a game of Rock Paper Scissors against another user.',
    aliases: ['rockpaperscissors'],
    category: "Fun",
    usage: "rps @user",
    async execute(message, args) {
        const mentionedUser  = message.mentions.users.first();

        // Check if a user is mentioned
        if (!mentionedUser) {
            return message.channel.send({
                embeds: [{
                    color: 0xFF0000, // Use integer color value
                    title: 'Error',
                    description: "Please mention the user you want to play against."
                }]
            });
        }

        // Check if the mentioned user is the same as the message author or a bot
        if (mentionedUser.id === message.author.id) {
            return message.channel.send({
                embeds: [{
                    color: 0xFF0000, // Use integer color value
                    title: 'Error',
                    description: "You cannot challenge yourself!"
                }]
            });
        }
        if (mentionedUser.bot) {
            return message.channel.send({
                embeds: [{
                    color: 0xFF0000, // Use integer color value
                    title: 'Error',
                    description: "You cannot challenge a bot!"
                }]
            });
        }

        // Check if either player is already in an active game
        if (activeGames.has(message.author.id) || activeGames.has(mentionedUser.id)) {
            return message.channel.send({
                embeds: [{
                    color: 0xFF0000, // Use integer color value
                    title: 'Error',
                    description: "One of the players is already in a game. Please finish the current game before starting a new one."
                }]
            });
        }

        activeGames.add(message.author.id);
        activeGames.add(mentionedUser.id);

        const choices = {};
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("Rock")
                    .setLabel("🪨 Rock")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("Paper")
                    .setLabel("📄 Paper")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("Scissors")
                    .setLabel("✂️ Scissors")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("Cancel")
                    .setLabel("❌ Cancel")
                    .setStyle(ButtonStyle.Danger)
            );

        const msg = await message.channel.send({
            embeds: [{
                color: 0x0099FF, // Use integer color value
                title: 'Rock Paper Scissors Game',
                description: `${message.author}, you've challenged ${mentionedUser} to a game of Rock Paper Scissors! React with your choice:`,
                footer: {
                    text: 'You have 60 seconds to make your choice!'
                }
            }],
            components: [row]
        });

        const filter = (interaction) => {
            return [message.author.id, mentionedUser.id].includes(interaction.user.id);
        };

        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            if (interaction.customId === "Cancel") {
                await message.channel.send({
                    embeds: [{
                        color: 0xFF0000, // Use integer color value
                        title: 'Game Canceled',
                        description: `${message.author} has canceled the game against ${mentionedUser}.`
                    }]
                });
                collector.stop('canceled');
                return;
            }

            choices[interaction.user.id] = interaction.customId;
            await interaction.reply({ content: `You chose ${interaction.customId}!`, ephemeral: true });

            if (Object.keys(choices).length === 2) {
                collector.stop(); // Stop the collector when both players have made their choices
            }
        });

        collector.on('end', async (collected, reason) => {
            activeGames.delete(message.author.id);
            activeGames.delete(mentionedUser.id);

            if (reason === 'canceled') {
                return; // Do not send timeout message if the game was canceled
            }

            if (Object.keys(choices).length < 2) {
                return message.channel.send({
                    embeds: [{
                        color: 0xFF0000, // Use integer color value
                        title: 'Game Timed Out',
                        description: "Game timed out. Please try again."
                    }]
                });
            }

            let winner;
            if (choices[message.author.id] === choices[mentionedUser.id]) {
                winner = "It's a draw!";
            } else if (
                (choices[message.author.id] === "Rock" && choices[mentionedUser.id] === "Scissors") ||
                (choices[message.author.id] === "Paper" && choices[mentionedUser.id] === "Rock") ||
                (choices[message.author.id] === "Scissors" && choices[mentionedUser.id] === "Paper")
            ) {
                winner = `${message.author} wins!`;
            } else {
                winner = `${mentionedUser} wins!`;
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(0x00FF00) // Use integer color value
                .setTitle("Rock Paper Scissors Result")
                .setDescription(`**Choices:**\n**${message.author}:** ${choices[message.author.id]}\n**${mentionedUser}:** ${choices[mentionedUser.id]}\n\n**Result:** ${winner}`)
                .setFooter({ text: 'Thanks for playing!' })
                .setTimestamp();

            message.channel.send({ embeds: [resultEmbed] });
        });
    }
};
