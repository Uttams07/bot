/*
const fs = require('fs');
const path = require('path');
const { Events, Collection, EmbedBuilder } = require('discord.js');
const Guild = require('../database/models/guild');
const User = require('../database/models/user');
const moment = require('moment-timezone');
const ascii = require('ascii-table');

const table = new ascii('File Loading Status:');
table.setHeading('FILE', 'STATUS');

module.exports = (client) => {
    client.commands = new Collection();
    client.slashCommands = new Collection();
    client.prefixCache = new Map(); // Cache for prefixes
    client.guildCache = new Map(); // Cache for guild data

    // Load command files from the commands folder
    const commandFolder = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandFolder).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandFolder, file));
            client.commands.set(command.name, command);

            // Register aliases
            if (command.aliases && Array.isArray(command.aliases)) {
                command.aliases.forEach(alias => {
                    client.commands.set(alias, command);
                });
            }

            table.addRow(file, '🟩');
        } catch (error) {
            table.addRow(file, '🟥');
        }
    }

    // Load slash command files from the slashCommands folder
    const slashCommandFolder = path.join(__dirname, '../slashCommands');
    const slashCommandFiles = fs.readdirSync(slashCommandFolder).filter(file => file.endsWith('.js'));

    for (const file of slashCommandFiles) {
        try {
            const slashCommand = require(path.join(slashCommandFolder, file));
            client.slashCommands.set(slashCommand.data.name, slashCommand);
            table.addRow(file, '🟩');
        } catch (error) {
            table.addRow(file, '🟥');
        }
    }

    console.log(table.toString());

    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot) return; // Ignore bot messages

        // Ensure the message is from a guild
        if (!message.guild) return;

        const guildId = message.guild.id; // Define guildId here

        // Check if the bot is directly mentioned (not in a reply)
if (message.mentions.has(client.user) && !message.reference) {
    // Get guild ID
    const guildId = message.guild.id;

    // Check if the prefix is cached
    let prefix = client.prefixCache.get(guildId);
    if (!prefix) {
        const guildData = await Guild.findOne({ guildID: guildId });
        prefix = guildData ? guildData.prefix : 'Love Cafe'; // Default prefix
        client.prefixCache.set(guildId, prefix); // Cache prefix

        if (guildData) {
            client.guildCache.set(guildId, guildData); // Cache guild data
        }
    }

            // Respond with a message about the bot and its prefix
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`Hello ${message.author}, I'm here to help! My prefix is \`${prefix}\`.`);
            await message.channel.send({ embeds: [embed] });
        }

        const userId = message.author.id;
        let user = await User.findOne({ userID: userId });

        // Check if the user is AFK
        if (user && user.afk) {
            await User.findOneAndUpdate({ userID: userId }, { $unset: { afk: '' } });
            try {
                await message.member.setNickname(message.member.displayName.replace('[AFK] ', ''));
            } catch (error) {
                console.error('Failed to change nickname:', error);
            }
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`${message.author}, welcome back! Your AFK status has been removed.`);
            await message.channel.send({ embeds: [embed] });
        }

        // Check if the user exists, if not create a new user
        if (!user) {
            user = new User({ userID: userId });
        }

        // Get the current date in IST
        const now = moment.tz('Asia/Kolkata');
        const today = now.format('YYYY-MM-DD');

        // Check if the last updated date is different from today
        if (user.lastUpdated && moment(user.lastUpdated).format('YYYY-MM-DD') !== today) {
            // Reset today's counts
            user.yesterdayCount = user.todayCount;
            user.todayCount = 0;
            user.lastUpdated = now; // Update lastUpdated to now
        }

        // Increment message counts
        user.messageCount += 1;
        user.todayCount += 1;

        // Save the updated user data
        await user.save();

        // Check if the prefix is cached
        let prefix = client.prefixCache.get(guildId);
        if (!prefix) {
            const guildData = await Guild.findOne({ guildID: guildId });
            prefix = guildData ? guildData.prefix : ''; // Default to 'Love Cafe' if no prefix is set
            client.prefixCache.set(guildId, prefix); // Cache the prefix

            if (guildData) {
                client.guildCache.set(guildId, guildData); // Cache guild data
            }
        }

        // Default prefixes
        const defaultPrefixes = ['test'];

        // Check if the message starts with any of the prefixes (case-insensitive)
        const isPrefix = defaultPrefixes.some(p => message.content.toLowerCase().startsWith(p.toLowerCase())) || 
                         message.content.toLowerCase().startsWith(prefix.toLowerCase());

        if (!isPrefix) return;

        // Extract command and arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase(); // Convert command to lowercase

        const command = client.commands.get(commandName);
        if (!command) {
            return;
        }

        try {
            await command.execute(message, args, client); // Pass client to the command
        } catch (error) {
            console.error(error);
            message.reply("There was an error trying to execute that command!");
        }
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error trying to execute that command!', ephemeral: true });
        }
    });
};
*/

/*
const fs = require('fs');
const path = require('path');
const { Events, Collection, EmbedBuilder } = require('discord.js');
const Guild = require('../database/models/guild');
const User = require('../database/models/user');
const moment = require('moment-timezone');
const ascii = require('ascii-table');

// Create separate tables for command types
const prefixTable = new ascii('Prefix Commands').setHeading('File', 'Status');
const slashTable = new ascii('Slash Commands').setHeading('File', 'Status');

module.exports = (client) => {
    client.commands = new Collection();
    client.slashCommands = new Collection();
    client.prefixCache = new Map();
    client.guildCache = new Map();

    // ========== COMMAND LOADING ==========
    const loadCommands = (folder, commandType) => {
        const commandFiles = fs.readdirSync(folder).filter(file => file.endsWith('.js'));
        
        commandFiles.forEach(file => {
            try {
                const command = require(path.join(folder, file));
                
                if (commandType === 'prefix') {
                    client.commands.set(command.name.toLowerCase(), command);
                    
                    // Register aliases
                    if (command.aliases?.length) {
                        command.aliases.forEach(alias => {
                            client.commands.set(alias.toLowerCase(), command);
                        });
                    }
                    prefixTable.addRow(file, '🟩 LOADED');
                } 
                else if (commandType === 'slash') {
                    client.slashCommands.set(command.data.name, command);
                    slashTable.addRow(file, '🟩 LOADED');
                }
            } catch (error) {
                commandType === 'prefix' 
                    ? prefixTable.addRow(file, '🟥 ERROR')
                    : slashTable.addRow(file, '🟥 ERROR');
            }
        });
    };

    // Load different command types
    loadCommands(path.join(__dirname, '../commands'), 'prefix');
    loadCommands(path.join(__dirname, '../slashCommands'), 'slash');

    // Display command tables
    console.log(prefixTable.toString());
    console.log(slashTable.toString());

    // ========== CACHE MANAGEMENT ==========
    const fetchGuildData = async (guildId) => {
        try {
            return await Guild.findOne({ guildID: guildId }) || 
                new Guild({ guildID: guildId, prefix: 'Love Cafe' });
        } catch {
            return { prefix: 'Love Cafe' };
        }
    };

    // ========== EVENT HANDLERS ==========
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot || !message.guild) return;

        const guildId = message.guild.id;
        const userId = message.author.id;

        try {
            // Prefix handling
            let prefix = client.prefixCache.get(guildId);
            if (!prefix) {
                const guildData = await fetchGuildData(guildId);
                prefix = guildData.prefix;
                client.prefixCache.set(guildId, prefix);
            }

            // AFK system
            const userData = await User.findOne({ userID: userId });
            if (userData?.afk) await handleAfkRemoval(message, userData);

            // Statistics tracking
            await updateUserStats(userId);

            // Command execution
            const defaultPrefixes = ['test', 'Love Cafe'];
            const isPrefixed = defaultPrefixes.some(p => message.content.toLowerCase().startsWith(p.toLowerCase())) ||
                message.content.toLowerCase().startsWith(prefix.toLowerCase());

            if (isPrefixed) {
                const args = message.content.slice(prefix.length).trim().split(/ +/);
                const commandName = args.shift().toLowerCase();
                const command = client.commands.get(commandName);

                if (command) await command.execute(message, args, client);
            }

            // Bot mention response
            if (message.mentions.has(client.user) && !message.reference) {
                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setDescription(`Hello ${message.author}, my prefix is \`${prefix}\``);
                await message.channel.send({ embeds: [embed] });
            }
        } catch {}
    });

    client.on(Events.InteractionCreate, async (interaction) => {
        if (!interaction.isCommand()) return;

        try {
            const command = client.slashCommands.get(interaction.commandName);
            if (command) await command.execute(interaction);
        } catch {
            await interaction.reply({ 
                content: '❌ An error occurred while executing this command',
                ephemeral: true 
            });
        }
    });
    // ========== HELPER FUNCTIONS ==========
    async function handleAfkRemoval(message) {
        try {
            await User.updateOne({ userID: message.author.id }, { $unset: { afk: '' } });
            
            if (message.member.manageable) {
                const newNickname = message.member.displayName.replace(/\[AFK\]\s*/      // remove ->
                /*i, '');
                await message.member.setNickname(newNickname);
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`${message.author}, welcome back! Your AFK status has been removed.`);
            
            await message.channel.send({ embeds: [embed] });
        } catch {}
    }

    async function updateUserStats(userId) {
        try {
            const now = moment.tz('Asia/Kolkata');
            const user = await User.findOne({ userID: userId }) || new User({ userID: userId });

            if (user.lastUpdated) {
                const lastUpdate = moment(user.lastUpdated).tz('Asia/Kolkata');
                if (!lastUpdate.isSame(now, 'day')) {
                    user.yesterdayCount = user.todayCount;
                    user.todayCount = 0;
                    user.lastUpdated = now.toDate();
                }
            }

            user.messageCount = (user.messageCount || 0) + 1;
            user.todayCount = (user.todayCount || 0) + 1;
            await user.save();
        } catch {}
    }
};
*/   /*
const fs = require('fs');
const path = require('path');
const { Collection, Events } = require('discord.js');
const ascii = require('ascii-table');

module.exports = (client) => {
    client.commands = new Collection();
    const table = new ascii('Prefix Commands').setHeading('File', 'Status');

    // Load prefix commands
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));
            client.commands.set(command.name, command);
            
            if (command.aliases?.length) {
                command.aliases.forEach(alias => {
                    client.commands.set(alias, command);
                });
            }
            table.addRow(file, '🟩 LOADED');
        } catch (error) {
            table.addRow(file, '🟥 ERROR');
        }
    }
    console.log(table.toString());

      

    // Prefix command handler
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot || !message.guild) return;

        const prefix = client.prefixCache.get(message.guild.id) || 'Love Cafe';
        const defaultPrefixes = ['test', 'Love Cafe'];
        
        if (!defaultPrefixes.some(p => message.content.toLowerCase().startsWith(p)) && 
            !message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (!command) return;

        try {
            await command.execute(message, args, client);
        } catch (error) {
            message.reply('Error executing command!');
        }
    });
}; */


const fs = require('fs');
const path = require('path');
const { Collection, Events } = require('discord.js');
const ascii = require('ascii-table');

module.exports = (client) => {
    client.commands = new Collection();
    const table = new ascii('Prefix Commands').setHeading('File', 'Status');

    // Load prefix commands
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        try {
            const command = require(path.join(commandsPath, file));

            // Ensure the command has an execute method
            if (!command.execute || typeof command.execute !== 'function') {
                console.error(`Command ${file} does not have a valid 'execute' method.`);
                table.addRow(file, '🟥 ERROR');
                continue;
            }

            // Register the command in the collection
            client.commands.set(command.name, command);

            // Register aliases if present
            if (command.aliases?.length) {
                command.aliases.forEach(alias => {
                    client.commands.set(alias, command);
                });
            }

            table.addRow(file, '🟩 LOADED');
        } catch (error) {
            console.error(`Error loading command ${file}:`, error);
            table.addRow(file, '🟥 ERROR');
        }
    }
    console.log(table.toString());

    // Prefix command handler
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot || !message.guild) return;

        const prefix = client.prefixCache?.get(message.guild.id) || 'test';
        const defaultPrefixes = ['test'];

        if (!defaultPrefixes.some(p => message.content.toLowerCase().startsWith(p)) &&
            !message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName);

        if (!command) return;

        // Check if the command has an execute method before invoking it
        if (command.execute && typeof command.execute === 'function') {
            try {
                await command.execute(message, args);  // Passing message and args only
            } catch (error) {
                console.error('Command Error:', error);
                message.reply('🚫 Error executing command!');
            }
        } else {
            console.error(`Command ${commandName} does not have a valid 'execute' method.`);
            message.reply('🚫 Command not valid!');
        }
    });
};
