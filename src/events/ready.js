const client = require("../../index.js");
const ms = require("ms");

module.exports = (client) => {
    client.once('ready', async () => {
        console.log(`[CLIENT] ${client.user.tag} is up and ready to go! Watching ${client.guilds.cache.size} servers and ${client.users.cache.size} users.`);
  
        const up = ms(ms(Math.round(process.uptime() - (client.uptime / 1000)) + ' seconds'));
        console.log(`[NODEJS] Your IDE took ${up} to load and connect to the bot.`);

        // Set the bot's activity
        const activityType = 'STREAMING'; // Change this as needed ('WATCHING', 'LISTENING', etc.)
        const activityText = 'Join us at Love Cafe!';
        const streamURL = 'https://discord.gg/loverzz'; // Required for streaming

        if (activityType === 'PLAYING' || activityType === 'STREAMING') {
            client.user.setActivity(activityText/*, { type: activityType, url: streamURL }*/);
        } else {
            client.user.setActivity(activityText, { type: activityType });
        }

        // Set the bot's status to 'idle'
        client.user.setStatus('idle'); // Other options: 'online', 'dnd', 'invisible'
    });
};
