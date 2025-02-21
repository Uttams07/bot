const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

// Track ongoing games to prevent duplicates
const ongoingGames = new Map();

module.exports = {
    name: 'tictactoe',
    description: 'Play a game of Tic-Tac-Toe with another user!',
    aliases: ['ttt'],
    category: 'Fun',
    usage: 'tictactoe @user',
    async execute(message, args) {
        // Validate opponent
        const opponent = message.mentions.members.first();
        
        if (!opponent || opponent.user.bot || opponent.id === message.author.id) {
            console.log(`[ERROR] Invalid opponent: ${opponent ? opponent.user.tag : 'None'}`);
            return message.reply("🚫 Mention a valid user to play with! (You can't play with bots or yourself)");
        }

        // Check if the user or opponent is already in a game
        if (ongoingGames.has(message.author.id) || ongoingGames.has(opponent.id)) {
            console.log(`[INFO] Either ${message.author.tag} or ${opponent.user.tag} is already in a game.`);
            return message.reply("🚫 Either you or the mentioned user is already in a game.");
        }

        // Mark players as in-game
        ongoingGames.set(message.author.id, opponent.id);
        ongoingGames.set(opponent.id, message.author.id);
        
        const players = [message.author, opponent.user];
        let currentPlayer = 0;
        let board = Array(9).fill(null);

        // Render the board with the necessary styles
        const renderBoard = (disabled = false) => {
            return board.map((value, index) =>
                new ButtonBuilder()
                    .setCustomId(index.toString())
                    .setLabel(value || '⋰')
                    .setStyle(value === '⚔️' ? ButtonStyle.Danger : value === '⭕' ? ButtonStyle.Primary : ButtonStyle.Secondary)
                    .setDisabled(disabled || Boolean(value)) // Disable button if clicked or game over
            );
        };

        // Create the board rows for the game
        const createBoard = (disabled = false) => {
            return [0, 1, 2].map(i => new ActionRowBuilder().addComponents(...renderBoard(disabled).slice(i * 3, i * 3 + 3)));
        };

        // Send message announcing the game
        await message.channel.send(`🎮 **${players[0]} vs ${players[1]}** - Tic-Tac-Toe match started!`);

        const gameMessage = await message.channel.send({
            content: `It's **${players[currentPlayer]}'s** turn!`,
            components: createBoard()
        });

        // Function to check for a win condition
        const checkWin = () => {
            const winPatterns = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];
            return winPatterns.find(pattern => {
                const [a, b, c] = pattern;
                return board[a] && board[a] === board[b] && board[a] === board[c];
            });
        };

        // Collect user interactions with a timeout
        const collector = gameMessage.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

        collector.on('collect', async interaction => {
            if (interaction.user.id !== players[currentPlayer].id) {
                console.log(`[INFO] ${interaction.user.tag} tried to play out of turn.`);
                return interaction.reply({ content: "It's not your turn!", ephemeral: true });
            }

            const index = parseInt(interaction.customId);
            if (board[index]) return; // Do nothing if the spot is already taken

            // Update board with current player's symbol
            board[index] = currentPlayer === 0 ? '⚔️' : '⭕';
            currentPlayer = 1 - currentPlayer; // Switch turns

            const winnerPattern = checkWin();
            if (winnerPattern) {
                collector.stop();
                return gameMessage.edit({
                    content: `🎉 **${players[1 - currentPlayer]}** wins!`,
                    components: createBoard(true) // Disable all buttons when game ends
                }).then(() => {
                    console.log(`[INFO] ${players[1 - currentPlayer].tag} wins the game.`);
                    ongoingGames.delete(message.author.id);
                    ongoingGames.delete(opponent.id);
                });
            }

            // Check for draw condition (if the board is full)
            if (board.every(cell => cell !== null)) {
                collector.stop();
                return gameMessage.edit({
                    content: "It's a draw! 🤝",
                    components: createBoard(true) // Disable all buttons when game ends
                }).then(() => {
                    console.log("[INFO] The game ended in a draw.");
                    ongoingGames.delete(message.author.id);
                    ongoingGames.delete(opponent.id);
                });
            }

            // Continue to the next player's turn
            await interaction.update({
                content: `It's **${players[currentPlayer]}'s** turn!`,
                components: createBoard()
            });
        });

        // Handle timeout or inactivity
        collector.on('end', async collected => {
            if (collected.size === 0) {
                console.log("[INFO] The game ended due to inactivity.");
                await message.channel.send("The game has ended due to inactivity.");
                ongoingGames.delete(message.author.id);
                ongoingGames.delete(opponent.id);
            }
        });
    }
};
