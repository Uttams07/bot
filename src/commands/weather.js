
const { EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'weather',
    description: 'Shows weather information for a location',
    aliases: ['forecast'],
    category: 'Utility',
    usage: 'weather <location>',
    async execute(message, args) {
        if (!args.length) {
            return message.reply('Please provide a location!');
        }

        const location = args.join(' ');
        const apiKey = process.env.WEATHER_API_KEY;
        
        try {
            const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
            const weather = response.data;

            const embed = new EmbedBuilder()
                .setTitle(`Weather in ${weather.name}, ${weather.sys.country}`)
                .setColor('#0099ff')
                .addFields(
                    { name: 'Temperature', value: `${Math.round(weather.main.temp)}°C`, inline: true },
                    { name: 'Weather', value: weather.weather[0].main, inline: true },
                    { name: 'Humidity', value: `${weather.main.humidity}%`, inline: true }
                )
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        } catch (error) {
            await message.reply('Could not fetch weather information. Please check the location name.');
        }
    }
};
