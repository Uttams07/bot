const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

const activeGames = new Set(); // To track active games

module.exports = {
    name: 'rpsls',
    aliases: ['rockpaperscissorslizardspock', 'spock'],
    category: 'Fun',
    description: 'Play a game of Rock Paper Scissors Lizard Spock against another user.',
    usage: 'rps @user',

    async execute(message, args) {
        const mentionedUser = message.mentions.users.first();

        // Check if a user is mentioned
        if (!mentionedUser) {
            return message.reply({
                embeds: [{
                    color: 0xFF0000,
                    title: 'Error',
                    description: 'Please mention the user you want to play against.'
                }]
            });
        }

        // Check if the mentioned user is the same as the message author or a bot
        if (mentionedUser.id === message.author.id) {
            return message.reply({
                embeds: [{
                    color: 0xFF0000,
                    title: 'Error',
                    description: 'You cannot challenge yourself!'
                }]
            });
        }
        if (mentionedUser.bot) {
            return message.reply({
                embeds: [{
                    color: 0xFF0000,
                    title: 'Error',
                    description: 'You cannot challenge a bot!'
                }]
            });
        }

        // Check if either player is already in an active game
        if (activeGames.has(message.author.id) || activeGames.has(mentionedUser.id)) {
            return message.reply({
                embeds: [{
                    color: 0xFF0000,
                    title: 'Error',
                    description: 'One of the players is already in a game. Please finish the current game before starting a new one.'
                }]
            });
        }

        // Add players to active games
        activeGames.add(message.author.id);
        activeGames.add(mentionedUser.id);

        const choices = {};
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('Rock')
                    .setLabel('Rock')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('Paper')
                    .setLabel('Paper')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('Scissors')
                    .setLabel('Scissors')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('Lizard')
                    .setLabel('Lizard')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('Spock')
                    .setLabel('Spock')
                    .setStyle('Primary')
            );

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Rock Paper Scissors Lizard Spock Game')
            .setDescription(`${message.author}, you've challenged ${mentionedUser} to a game! React with your choice:`)
            .setFooter({ text: 'You have 60 seconds to make your choice!' });

        const msg = await message.reply({ embeds: [embed], components: [row] });

        const filter = (interaction) => {
            return [message.author.id, mentionedUser.id].includes(interaction.user.id);
        };

        const collector = msg.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async (interaction) => {
            choices[interaction.user.id] = interaction.customId;
            await interaction.reply({ content: `You chose ${interaction.customId}!`, flags: 64 }); // Use flags for ephemeral

            if (Object.keys(choices).length === 2) {
                collector.stop(); // Stop the collector when both players have made their choices
            }
        });

        collector.on('end', async (collected, reason) => {
            activeGames.delete(message.author.id);
            activeGames.delete(mentionedUser.id);

            if (Object.keys(choices).length < 2) {
                return message.channel.send({
                    embeds: [{
                        color: 0xFF0000,
                        title: 'Game Timed Out',
                        description: 'Game timed out. Please try again.'
                    }]
                });
            }

            let winner;
            const userChoice = choices[message.author.id];
            const opponentChoice = choices[mentionedUser.id];

            if (userChoice === opponentChoice) {
                winner = "It's a draw!";
            } else if (
                (userChoice === 'Rock' && (opponentChoice === 'Scissors' || opponentChoice === 'Lizard')) ||
                (userChoice === 'Paper' && (opponentChoice === 'Rock' || opponentChoice === 'Spock')) ||
                (userChoice === 'Scissors' && (opponentChoice === 'Paper' || opponentChoice === 'Lizard')) ||
                (userChoice === 'Lizard' && (opponentChoice === 'Spock' || opponentChoice === 'Paper')) ||
                (userChoice === 'Spock' && (opponentChoice === 'Scissors' || opponentChoice === 'Rock'))
            ) {
                winner = `${message.author} wins!`;
            } else {
                winner = `${mentionedUser} wins!`;
            }

            const resultEmbed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('Rock Paper Scissors Lizard Spock Result')
                .setDescription(`**Choices:**\n**${message.author}:** ${userChoice}\n**${mentionedUser}:** ${opponentChoice}\n\n**Result:** ${winner}`)
                .setFooter({ text: 'Thanks for playing!' })
                .setTimestamp();

            message.channel.send({ embeds: [resultEmbed] });
        });
    }
};