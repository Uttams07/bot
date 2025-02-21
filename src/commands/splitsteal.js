const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'splitsteal',
    aliases: ['ss', 'sos'],
    category: 'Fun',
    description: 'Play a game of Split or Steal!',
    usage: `splitsteal @user1 [@user2]`,

    async execute(message, args) {
        const mentionedUsers = message.mentions.users;

        // Ensure there are one or two users mentioned
        if (mentionedUsers.size === 0 || mentionedUsers.size > 2) {
            return message.reply('🚫 Please mention one or two users to start.');
        }

        // Ensure the mentioned users are not the bot or the message author
        if (mentionedUsers.has(message.author.id)) {
            return message.reply('🚫 You cannot mention yourself!');
        }

        if (mentionedUsers.has(message.client.user.id)) {
            return message.reply('🚫 You cannot mention the bot!');
        }

        let player1, player2;
        if (mentionedUsers.size === 1) {
            player1 = message.author;
            player2 = mentionedUsers.first();
        } else {
            player1 = mentionedUsers.first();
            player2 = mentionedUsers.last();
        }

        // Check for ongoing game in the channel
        const activeGames = new Map();

        if (activeGames.has(message.channel.id)) {
            return message.reply('🚫 A game is already in progress in this channel. Please wait for it to finish.');
        }

        const embed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('Split or Steal')
            .setDescription(`${player1.username} and ${player2.username}, please make your choice (split or steal) using the buttons below.`);

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('split')
                    .setLabel('Split')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('steal')
                    .setLabel('Steal')
                    .setStyle('Danger'),
                new ButtonBuilder()
                    .setCustomId('cancel')
                    .setLabel('Cancel')
                    .setStyle('Secondary')
            );

        const gameMessage = await message.channel.send({ embeds: [embed], components: [row] });

        activeGames.set(message.channel.id, { player1: player1.id, player2: player2.id, playerChoices: new Map() });

        const buttonFilter = i => {
            return ['split', 'steal', 'cancel'].includes(i.customId) && [player1.id, player2.id].includes(i.user.id);
        };

        const buttonCollector = gameMessage.createMessageComponentCollector({ filter: buttonFilter, time: 30000 });

        buttonCollector.on('collect', async i => {
            if (i.customId === 'cancel') {
                await i.reply({ content: 'The game has been canceled.', flags: 64 }); // Use flags for ephemeral
                buttonCollector.stop();
            } else {
                const gameData = activeGames.get(message.channel.id);
                gameData.playerChoices.set(i.user.id, i.customId);
                await i.reply({ content: `You chose to ${i.customId}. Waiting for the other player...`, flags: 64 }); // Use flags for ephemeral

                if (gameData.playerChoices.size === 2) {
                    buttonCollector.stop();
                }
            }
        });

        buttonCollector.on('end', async collected => {
            const gameData = activeGames.get(message.channel.id);
            let endMessage;

            if (!gameData || gameData.playerChoices.size < 2) {
                endMessage = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Game Ended')
                    .setDescription('The game was canceled or timed out.');
            } else {
                const choice1 = gameData.playerChoices.get(player1.id);
                const choice2 = gameData.playerChoices.get(player2.id);

                let result;
                if (choice1 === 'split' && choice2 === 'split') {
                    result = `Both chose to **split**! Each player gets 50-50 of the reward.`;
                } else if (choice1 === 'steal' && choice2 === 'steal') {
                    result = `Both chose to **steal**! No one gets any reward.`;
                } else if (choice1 === 'split' && choice2 === 'steal') {
                    result = `${player2.username} chose to **steal** and ${player1.username} chose to **split**! ${player2.username} gets the reward.`;
                } else if (choice1 === 'steal' && choice2 === 'split') {
                    result = `${player1.username} chose to **steal** and ${player2.username} chose to **split**! ${player1.username} gets the reward.`;
                }

                endMessage = new EmbedBuilder()
                    .setColor('#ffcc00')
                    .setTitle('Split or Steal Result')
                    .setDescription(result)
                    .addFields(
                        { name: player1.username, value: `Choice: ${choice1}`, inline: true },
                        { name: player2.username, value: `Choice: ${choice2}`, inline: true }
                    );
            }

            const disabledRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('split')
                        .setLabel('Split')
                        .setStyle('Primary')
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('steal')
                        .setLabel('Steal')
                        .setStyle('Danger')
                        .setDisabled(true),
                    new ButtonBuilder()
                        .setCustomId('cancel')
                        .setLabel('Cancel')
                        .setStyle('Secondary')
                        .setDisabled(true)
                );

            await gameMessage.edit({ embeds: [endMessage], components: [disabledRow] });

            activeGames.delete(message.channel.id);
        });
    }
};