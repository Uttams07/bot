
const ms = require('ms');

module.exports = {
    name: 'timer',
    description: 'Sets a timer',
    aliases: ['countdown'],
    category: 'Utility',
    usage: 'timer <duration>',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a duration! Example: `timer 30m`');
        }

        const duration = args[0];
        const msTime = ms(duration);

        if (!msTime) {
            return message.reply('Please provide a valid duration format (e.g., 1h, 30m, 1d)');
        }

        await message.reply(`Timer set for ${duration}`);

        setTimeout(async () => {
            await message.reply(`⏰ Time's up! Your ${duration} timer has finished.`);
        }, msTime);
    }
};
