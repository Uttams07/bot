/*const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/database/connection'); // Import the database connection
const messageHandler = require('./src/events/message');// Adjust the path as necessary
const guildMemberAddHandler = require('./src/events/guildMemberAdd');
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


// Connect to MongoDB
connectDB(); // Call the function to connect to the database

// Event handlers
messageHandler(client);
guildMemberAddHandler(client);
readyHandler(client);

// Log in to Discord
client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('Bot logged in successfully'))
    .catch(err => console.error('Failed to log in:', err));
 */
    const { Client, GatewayIntentBits, Collection } = require('discord.js');
    const mongoose = require('mongoose');
    const dotenv = require('dotenv');
    const connectDB = require('./src/database/connection'); // Import the database connection
    const miscHandler = require('./src/events/misc'); // Updated path
    const prefixCommandsHandler = require('./src/events/prefix'); // Updated path
    const slashCommandsHandler = require('./src/events/slash'); // Updated path
    const guildMemberAddHandler = require('./src/events/guildMemberAdd');
    const readyHandler = require('./src/events/ready');
    const imagesenderHandler = require('./src/events/imagesender');
    const keepAlive = require('./server');
    

    // Load environment variables from .env file
    dotenv.config();
    
    // Create a new Discord client with required intents
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.MessageContent,
            GatewayIntentBits.GuildMembers,
            GatewayIntentBits.GuildPresences
        ],
    });
    
    // Connect to MongoDB
    connectDB(); // Call the function to connect to the database
    keepAlive();
    // Event handlers
    miscHandler(client);
    prefixCommandsHandler(client);
    slashCommandsHandler(client);
    guildMemberAddHandler(client);
    //imagesenderHandler(client);
    readyHandler(client);
    
    // Log in to Discord
    client.login(process.env.DISCORD_TOKEN)
        .then(() => console.log('Bot logged in successfully'))
        .catch(err => console.error('Failed to log in:', err));
    