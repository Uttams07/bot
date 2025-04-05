const { Routes } = require('discord.js');
const { REST } = require('@discordjs/rest');
const fs = require('fs');
const path = require('path');

module.exports = async (client) => {
    const commands = [];
    const commandsPath = path.join(__dirname, '../../slashCommands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        commands.push(command.data.toJSON());
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    client.once('ready', async () => {
        try {
            console.log(`Started refreshing ${commands.length} application (/) commands.`);
            
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );

            console.log(`Successfully reloaded application (/) commands.`);
            console.log(`Logged in as ${client.user.tag}!`);
            
            client.user.setActivity('with discord-bots', { type: 'PLAYING' });
        } catch (error) {
            console.error(error);
        }
    });
};