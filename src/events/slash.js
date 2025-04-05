const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.slashCommands = new Collection();
    const commandsPath = path.join(__dirname, '../../slashCommands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    // Load all slash command files
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.slashCommands.set(command.data.name, command);
    }

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.slashCommands.get(interaction.commandName);

        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'There was an error executing this command!', 
                ephemeral: true 
            });
        }
    });
};