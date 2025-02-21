const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'poll',
    aliases: ['createpoll'],
    category: 'Utility',
    description: 'Creates a poll with multiple options (enclose multi-word options in quotes).',
    usage: '[question], [option1 "option 2" ...], [duration]',
    examples: [
        `poll "What's your favorite color?", "Red" "Sky Blue" Green, 1m`,
        `poll "Do you like pizza?", Yes No "Maybe Later", 30s`
    ],

    async execute(message, args) {
        // Check if the user provided a question
        if (args.length < 1) {
            const embed = new EmbedBuilder()
                .setColor('#FF0000')
                .setDescription('❌ Please provide a question for the poll!')
                .setFooter({ text: `Requested by ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();
            return message.reply({ embeds: [embed] });
        }

        // Join the arguments into a single string and split by commas
        const input = args.join(' ');
        const parts = input.split(/(?<!\\),/).map(part => part.trim()); // Split by unescaped commas

        // Extract the question, options, and duration
        const question = parts[0].replace(/\\,/g, ','); // Allow escaped commas in question
        const options = parts[1] ? this.splitOptions(parts[1]) : [];
        let durationArg = parts[2] || '1m';

        // Set default options if none are provided
        if (options.length === 0) options.push('Yes', 'No');

        // Validate duration
        let duration = this.parseDuration(durationArg);
        if (!duration) {
            duration = 1 * 60 * 1000; // Default to 1 minute
            durationArg = '1m';
        }

        // Create and send the poll
        const pollEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`Poll: ${question}`)
            .setDescription(options.map((option, index) => `${index + 1}. ${option}`).join('\n'))
            .setFooter({ text: `Poll ends in ${durationArg}`, iconURL: message.author.displayAvatarURL() });

        const pollMessage = await message.reply({ embeds: [pollEmbed] });

        // Add reactions
        for (let i = 0; i < options.length; i++) {
            await pollMessage.react(`${i + 1}️⃣`);
        }

        // Handle poll end
        setTimeout(async () => {
            try {
                // Fetch the updated message with reactions
                const updatedMessage = await pollMessage.fetch();

                // Create the results embed
                const resultsEmbed = new EmbedBuilder()
                    .setColor('#FFA500')
                    .setTitle(`Results: ${question}`)
                    .setDescription(options.map((option, index) => {
                        const reaction = updatedMessage.reactions.cache.get(`${index + 1}️⃣`);
                        const votes = reaction ? reaction.count - 1 : 0; // Subtract 1 for the bot's reaction
                        return `**${option}:** ${votes} vote${votes !== 1 ? 's' : ''}`;
                    }).join('\n'));

                // Send the results embed
                await message.channel.send({ embeds: [resultsEmbed] });

                // Remove reactions from the poll message
                await pollMessage.reactions.removeAll();
            } catch (error) {
                console.error('Poll Error:', error);
                await message.reply('❌ Failed to calculate poll results.');
            }
        }, duration);

        // Delete command message
        try { await message.delete(); } catch (error) {}
    },

    // Helper function to split options with quotes
    splitOptions(optionsStr) {
        const regex = /"([^"]+)"|(\S+)/g;
        const options = [];
        let match;
        while ((match = regex.exec(optionsStr)) !== null) {
            options.push(match[1] || match[2]);
        }
        return options;
    },

    // Duration parser
    parseDuration(duration) {
        const match = duration.match(/^(\d+)(s|m|h)$/);
        if (!match) return null;
        const units = { s: 1000, m: 60000, h: 3600000 };
        return parseInt(match[1]) * units[match[2]];
    }
};
