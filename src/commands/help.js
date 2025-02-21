const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    name: 'help',
    description: 'Lists all commands and their descriptions, along with bot information',
    aliases: ['h'],
    category: 'Information',
    usage: 'help [command]',

    async execute(message, args) {
        const commands = message.client.commands;
        const guildId = message.guild.id;
        const prefix = message.client.prefixCache.get(guildId) || 'love';

        if (args[0]) {
            const command =
                commands.get(args[0].toLowerCase()) ||
                commands.find(c => c.aliases && c.aliases.includes(args[0].toLowerCase()));

            if (!command) {
                const embed = new EmbedBuilder()
                    .setDescription(`Couldn't find that command, try to run the command \`${prefix}help\`.`)
                    .setColor("#FF0000");

                return message.reply({ embeds: [embed] }).then(async (msg) => {
                    await wait(5000);
                    msg.delete().catch(() => {});
                });
            } else {
                const embed = new EmbedBuilder()
                    .setAuthor({ name: `${message.client.user.username}`, iconURL: message.client.user.displayAvatarURL() })
                    .setTitle(`Command information: ${prefix}${command.name}`)
                    .addFields(
                        { name: "Description", value: command.description || "[No description]", inline: false },
                        { name: "Aliases", value: command.aliases.length ? command.aliases.map(al => `\`${prefix}${al}\``).join(", ") : "[No aliases]", inline: false },
                        { name: "Category", value: command.category || "Uncategorized", inline: false },
                        { name: "Usage", value: `\`${prefix}${command.usage}\``, inline: false }
                    )
                    .setColor("#0099ff");

                return message.reply({ embeds: [embed] });
            }
        }

        // Categorize commands without duplicates
        const categories = {};
        commands.forEach(command => {
            const category = command.category || 'Uncategorized';
            if (!categories[category]) categories[category] = new Map();
            categories[category].set(command.name, command);
        });

        const mainEmbed = new EmbedBuilder()
            .setAuthor({ name: message.client.user.username, iconURL: message.client.user.displayAvatarURL() })
            .setTitle('Bot Commands and Information')
            .setDescription(`Use \`${prefix}help <command>\` for more details.
            
            **Prefix:** \`${prefix}\`
            **Bot Name:** Love Cafe ™
            **Developer:** uttams07`)
            .setColor('#0099ff')
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({ text: `Developed by uttams07`, iconURL: message.client.user.displayAvatarURL() })
            .setTimestamp();

        const createButtons = (showBack = false, disable = false) => {
            const rows = [];
            let row = new ActionRowBuilder();
            Object.keys(categories).forEach((category, index) => {
                if (row.components.length === 5) {
                    rows.push(row);
                    row = new ActionRowBuilder();
                }
                row.addComponents(new ButtonBuilder()
                    .setCustomId(`category_${category}`)
                    .setLabel(category)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disable));
            });
            if (row.components.length) rows.push(row);
            if (showBack) {
                rows.push(new ActionRowBuilder().addComponents(new ButtonBuilder()
                    .setCustomId('back_main')
                    .setLabel('Back to Main')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disable)));
            }
            return rows;
        };

        const mainMessage = await message.reply({ embeds: [mainEmbed], components: createButtons() });

        const filter = i => i.user.id === message.author.id;
        const collector = mainMessage.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            if (i.customId === 'back_main') {
                await i.update({ embeds: [mainEmbed], components: createButtons() });
            } else {
                const category = i.customId.replace('category_', '');
                const categoryCommands = categories[category] ? [...categories[category].values()] : [];
                const categoryEmbed = new EmbedBuilder()
                    .setTitle(`Commands in ${category}`)
                    .setDescription(categoryCommands.length > 0 
                        ? categoryCommands.map(cmd => `\`${cmd.name}\`: ${cmd.description || "[No description]"}`).join('\n') 
                        : "No commands available in this category.")
                    .setColor("#0000FF");
                await i.update({ embeds: [categoryEmbed], components: createButtons(true) });
            }
        });

        collector.on('end', async () => {
            try {
                await mainMessage.edit({ embeds: [mainEmbed], components: createButtons(true, true) });
            } catch (error) {
                if (error.code === 10008) {
                    console.error("❌ Message not found! Sending a new one instead.");
                    await message.channel.send({ embeds: [mainEmbed], components: createButtons(true, true) });
                } else {
                    console.error("❌ Unexpected error:", error);
                }
            }
        });
    }
};
