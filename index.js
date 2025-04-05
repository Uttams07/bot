const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const messageHandler = require('./src/events/message');// Adjust the path as necessary
const readyHandler = require('./src/events/ready');

// Load environment variables from .env file
dotenv.config();

// Create a new Discord client with required intents
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, // Required for guild-related events
        GatewayIntentBits.GuildMessages, // Required for message events in guilds
        GatewayIntentBits.MessageContent, // Required to read message content
        GatewayIntentBits.GuildMembers, // Required for guild member events
        GatewayIntentBits.GuildPresences // Required for guild presence events
    ],
});


// Event handlers
messageHandler(client);
guildMemberAddHandler(client);
readyHandler(client);

// Log in to Discord
client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('Bot logged in successfully'))
    .catch(err => console.error('Failed to log in:', err));
