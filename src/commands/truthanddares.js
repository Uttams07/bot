const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'truthordare', // Command name
    description: 'Play a game of Truth or Dare!', // Command description
    aliases: ['tod', 'td'], // Command aliases
    category: 'Fun', // Command category
    usage: 'truthordare', // Command usage instructions

    async execute(message, args) {
        // Load truth and dare questions from JSON files
        const truths = JSON.parse(fs.readFileSync(path.join(__dirname, '../storage', 'truths.json'), 'utf-8'));
        const dares = JSON.parse(fs.readFileSync(path.join(__dirname, '../storage', 'dares.json'), 'utf-8'));

        // Create buttons for Truth and Dare
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('truth')
                    .setLabel('Truth')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('dare')
                    .setLabel('Dare')
                    .setStyle('Danger')
            );

        // Create the initial embed
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('Truth or Dare')
            .setDescription('Choose Truth or Dare by clicking one of the buttons below!');

        // Send the embed with buttons
        const gameMessage = await message.channel.send({ embeds: [embed], components: [row] });

        // Set up a collector to handle button interactions
        const filter = i => i.customId === 'truth' || i.customId === 'dare';
        const collector = gameMessage.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async i => {
            try {
                if (i.customId === 'truth') {
                    // Select a random truth question
                    const truth = truths[Math.floor(Math.random() * truths.length)];
                    const truthEmbed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle('Truth')
                        .setDescription(truth)
                        .setFooter({ text: 'Answer honestly!' });

                    // Update the message with the truth question
                    await i.update({ embeds: [truthEmbed], components: [] });
                } else if (i.customId === 'dare') {
                    // Select a random dare question
                    const dare = dares[Math.floor(Math.random() * dares.length)];
                    const dareEmbed = new EmbedBuilder()
                        .setColor('#ff0000')
                        .setTitle('Dare')
                        .setDescription(dare)
                        .setFooter({ text: 'Complete the dare!' });

                    // Update the message with the dare question
                    await i.update({ embeds: [dareEmbed], components: [] });
                }
            } catch (error) {
                console.error('Error handling button interaction:', error);
                await i.update({ content: '🚫 An error occurred while fetching a question.', components: [] });
            }
        });

        collector.on('end', collected => {
            // If no interactions were collected, end the game due to inactivity
            if (collected.size === 0) {
                gameMessage.edit({ content: 'The game has ended due to inactivity.', components: [] });
            }
        });
    },
};