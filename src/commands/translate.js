const { EmbedBuilder } = require('discord.js');
const { translate } = require('bing-translate-api');

module.exports = {
    name: 'translate',
    aliases: ['tl'],
    category: 'Utility',
    description: 'Translates a word, phrase, or replied message to your preferred language.',
    usage: '[language] [text]',
    examples: [
        'translate spanish Hello',
        'tl french Goodbye',
        'tl (replies to a message to translate it to English)',
        'tl hindi (replies to a message to translate it to Hindi)'
    ],

    async execute(message, args) {
        // Check if the user is replying to a message (for `tl` command)
        const repliedMessage = message.reference?.messageId;
        const targetLanguage = args[0]?.toLowerCase() || 'en'; // Default to English if no language is provided

        let textToTranslate;

        if (repliedMessage) {
            // Fetch the replied message
            const fetchedMessage = await message.channel.messages.fetch(repliedMessage);
            textToTranslate = fetchedMessage.content;
        } else if (args.length < 1) {
            // No arguments and no replied message
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ Please provide a language and text to translate, or reply to a message with `tl [language]`.')
                        .setFooter({ text: 'Example: `tl spanish Hello` or reply to a message with `tl`' })
                ]
            });
        } else {
            // Use the provided text
            textToTranslate = args.slice(1).join(' ');
        }

        // Validate the text to translate
        if (!textToTranslate) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription('❌ No text found to translate. Please provide text or reply to a message.')
                ]
            });
        }

        try {
            // Translate the text
            const result = await translate(textToTranslate, null, targetLanguage);

            // Create the embed for the translation result
            const embed = new EmbedBuilder()
                .setTitle('🌍 Translator')
                .setColor('#00FF00')
                .addFields(
                    { name: 'Original Text', value: `\`\`\`${result.text}\`\`\``, inline: false },
                    { name: 'Translated Text', value: `\`\`\`${result.translation}\`\`\``, inline: false }
                )
                .setFooter({ text: `Translated to ${targetLanguage.toUpperCase()}`, iconURL: message.author.displayAvatarURL() })
                .setTimestamp();

            // Send the embed to the channel
            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Translation Error:', error);
            await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setDescription(`❌ Failed to translate **${textToTranslate}** to **${targetLanguage.toUpperCase()}**.`)
                ]
            });
        }
    }
};