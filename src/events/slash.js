const { SlashCommandBuilder, Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ascii = require('ascii-table');
const chokidar = require('chokidar');

module.exports = (client) => {
    // Configuration
    const config = {
        commandsDir: path.join(__dirname, '../slashCommands'), // Directory for slash commands
        devMode: process.env.NODE_ENV === 'development', // Enable hot-reload in development
        cooldowns: new Collection() // Cooldowns for slash commands
    };

    // ASCII table for command loading status
    const table = new ascii('Slash Commands').setHeading('File', 'Status');

    // Collection to store slash commands
    client.slashCommands = new Collection();

    // Helper functions
    const helpers = {
        debounce: (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func(...args), wait);
            };
        }
    };

    // Command validation
    const validateCommand = (command) => {
        const required = ['data', 'execute'];
        if (!required.every(prop => command[prop])) {
            return false;
        }
        return true;
    };

    // Load slash commands
    const loadCommands = async (directory = config.commandsDir) => {
        const commandFiles = fs.readdirSync(directory).filter(file => file.endsWith('.js'));
        
        for (const file of commandFiles) {
            const filePath = path.join(directory, file);
            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);
                
                if (validateCommand(command)) {
                    client.slashCommands.set(command.data.name, command);
                    table.addRow(file, '🟩 LOADED');
                } else {
                    table.addRow(file, '🟥 INVALID STRUCTURE');
                }
            } catch (error) {
                console.error(`Error loading command ${file}:`, error);
                table.addRow(file, '🟥 ERROR');
            }
        }
    };

    // Deploy slash commands globally
    const deployCommands = async () => {
        try {
            if (!client.user) {
                throw new Error('Client user is not available. Bot may not be fully ready.');
            }

            const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
            const body = Array.from(client.slashCommands.values()).map(cmd => cmd.data.toJSON());
            
            await rest.put(Routes.applicationCommands(client.user.id), { body });
            console.log(`Successfully deployed ${body.length} slash commands.`);
        } catch (error) {
            console.error('Failed to update slash commands:', error);
        }
    };

    // Handle cooldowns for slash commands
    const handleCooldown = (userId, commandName, cooldown) => {
        const key = `${userId}-${commandName}`;
        const now = Date.now();
        const timestamps = config.cooldowns.get(key) || [];
        const cooldownAmount = cooldown * 1000;

        const validTimestamps = timestamps.filter(ts => now - ts < cooldownAmount);
        if (validTimestamps.length > 0) {
            return validTimestamps[0] + cooldownAmount;
        }

        config.cooldowns.set(key, [...validTimestamps, now]);
        return null;
    };

    // Execute slash commands
    const executeSlashCommand = async (interaction) => {
        if (!interaction.isCommand()) return; // Only handle slash commands

        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        // Handle cooldowns
        if (command.cooldown) {
            const remaining = handleCooldown(
                interaction.user.id,
                command.data.name,
                command.cooldown
            );

            if (remaining) {
                return interaction.reply({
                    content: `Please wait ${command.cooldown} seconds between uses!`,
                    ephemeral: true
                });
            }
        }

        // Execute the command
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}:`, error);
            await interaction.reply({
                content: 'There was an error executing this command!',
                ephemeral: true
            });
        }
    };

    // Hot-reload in development
    if (config.devMode) {
        let isBotReady = false; // Track if the bot is ready

        const watcher = chokidar.watch(config.commandsDir, { ignored: /^\./, persistent: true });
        const reload = helpers.debounce(async () => {
            if (!isBotReady) {
                console.log('Bot is not ready yet. Skipping hot-reload.');
                return;
            }

            console.log('Detected changes, reloading slash commands...');
            client.slashCommands.clear();
            table.clearRows();
            await loadCommands();
            await deployCommands();
            console.log(table.toString());
        }, 1000);

        watcher
            .on('add', reload)
            .on('change', reload)
            .on('unlink', reload);

        // Mark bot as ready
        client.once('ready', () => {
            isBotReady = true;
        });
    }

    // Initialize
    client.once('ready', async () => {
        console.log('Bot is ready! Loading slash commands...');
        await loadCommands();
        await deployCommands();
        console.log(table.toString());
        console.log('Slash command handler initialized!');
    });

    // Handle interactions (only for slash commands)
    client.on('interactionCreate', executeSlashCommand);
};