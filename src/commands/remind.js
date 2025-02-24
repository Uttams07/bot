
const ms = require('ms');

module.exports = {
    name: 'remind',
    description: 'Sets a reminder',
    aliases: ['reminder', 'remindme'],
    category: 'Utility',
    usage: 'remind <time> <message>',
    async execute(message, args) {
        if (args.length < 2) {
            return message.reply('Please provide both time and message! Example: `remind 1h Check email`');
        }

        const time = args[0];
        const reminder = args.slice(1).join(' ');
        
        const msTime = ms(time);
        if (!msTime) {
            return message.reply('Please provide a valid time format (e.g., 1h, 30m, 1d)');
        }

        await message.reply(`I will remind you about "${reminder}" in ${time}`);

        setTimeout(async () => {
            await message.author.send(`Reminder: ${reminder}`);
        }, msTime);
    }
};
