
const { Collection, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const ascii = require('ascii-table');
const chokidar = require('chokidar');

module.exports = (client) => {
    // Configuration
    const config = {
        commandsDir: path.join(__dirname, '../slashCommands'),
        devMode: process.env.NODE_ENV === 'development',
        cooldowns: new Collection()
    };

    // ASCII table for command loading status
    const table = new ascii('Slash Commands').setHeading('Command', 'Status');

    // Collection to store slash commands
    client.slashCommands = new Collection();

    // Command validation
    const validateCommand = (command) => {
        if (!command.data || !command.execute) {
            return false;
        }
        return true;
    };

    // Load commands
    const loadCommands = async () => {
        client.slashCommands.clear(); // Clear existing commands
        table.clearRows(); // Clear the table
        
        const files = fs.readdirSync(config.commandsDir).filter(file => file.endsWith('.js'));
        const uniqueFiles = [...new Set(files)]; // Remove duplicates
        
        for (const file of uniqueFiles) {
            try {
                delete require.cache[require.resolve(`${config.commandsDir}/${file}`)];
                const command = require(`${config.commandsDir}/${file}`);
                
                if (validateCommand(command)) {
                    client.slashCommands.set(command.data.name, command);
                    table.addRow(file, '✅');
                } else {
                    table.addRow(file, '❌');
                }
            } catch (error) {
                table.addRow(file, '❌');
                console.error(`Error loading command ${file}:`, error);
            }
        }
    };

    // Deploy slash commands
    const deployCommands = async () => {
        if (!client.user) {
            console.log('[WARNING] Client not ready, skipping command deployment');
            return;
        }

        try {
            console.log('[INFO] Started refreshing application (/) commands.');
            
            const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data.toJSON());
            const rest = new REST().setToken(process.env.DISCORD_TOKEN);
            
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );

            console.log(`[SUCCESS] Successfully reloaded ${commands.length} application (/) commands.`);
        } catch (error) {
            console.error('[ERROR] Failed to reload application commands:', error);
        }
    };

    // Handle cooldowns
    const handleCooldown = (interaction, command) => {
        if (!command.cooldown) return false;

        const { cooldowns } = config;
        const key = `${interaction.user.id}-${command.data.name}`;
        const cooldownAmount = command.cooldown * 1000;

        if (!cooldowns.has(key)) {
            cooldowns.set(key, Date.now());
            return false;
        }

        const expirationTime = cooldowns.get(key) + cooldownAmount;
        if (Date.now() < expirationTime) {
            const timeLeft = (expirationTime - Date.now()) / 1000;
            return timeLeft;
        }

        cooldowns.set(key, Date.now());
        return false;
    };

    // Development mode hot-reload
    if (config.devMode) {
        const watcher = chokidar.watch(config.commandsDir, {
            ignored: /(^|[\/\\])\../,
            persistent: true
        });

        watcher
            .on('add', async () => {
                await loadCommands();
                if (client.isReady()) await deployCommands();
            })
            .on('change', async () => {
                await loadCommands();
                if (client.isReady()) await deployCommands();
            })
            .on('unlink', async () => {
                await loadCommands();
                if (client.isReady()) await deployCommands();
            });
    }

    // Initialize commands when bot is ready
    client.once('ready', async () => {
        await loadCommands();
        await deployCommands();
        console.log(table.toString());
    });

    // Handle slash command interactions
    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;

        try {
            const cooldownTime = handleCooldown(interaction, command);
            if (cooldownTime) {
                return interaction.reply({
                    content: `Please wait ${cooldownTime.toFixed(1)} more seconds before using this command.`,
                    ephemeral: true
                });
            }

            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            }).catch(console.error);
        }
    });
};
