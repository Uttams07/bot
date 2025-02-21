const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'math',
    aliases: ['calc'],
    category: 'Utility',
    description: 'Perform a simple math calculation',
    usage: 'math <expression>',
    examples: ['math 2+2', 'math 5*3'],

    async execute(message, args) {
        // Check if an expression is provided
        if (!args[0]) {
            return message.reply('Please provide a math expression to evaluate.');
        }

        const expression = args.join(' ');

        // Validate the expression to prevent malicious code execution
        const validExpression = /^[\d\s+\-*/().%]+$/.test(expression);
        if (!validExpression) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle('Invalid Expression')
                        .setDescription('Your expression contains invalid characters. Only numbers and basic math operators are allowed.')
                        .setFooter({ text: `Requested by ${message.author.username}` })
                        .setTimestamp(),
                ],
            });
        }

        try {
            // Evaluate the expression
            const result = eval(expression);

            // Send the result as an embed
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Calculation Result')
                .setDescription(`The result of **${expression}** is **${result}**`)
                .setFooter({ text: `Requested by ${message.author.username}` })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            // Handle errors
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Error')
                .setDescription(`An error occurred while evaluating your expression: **${error.message}**`)
                .setFooter({ text: `Requested by ${message.author.username}` })
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        }
    },
};