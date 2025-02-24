
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Shows weather information for a location')
        .addStringOption(option =>
            option.setName('location')
                .setDescription('The location to get weather for')
                .setRequired(true)),
    async execute(interaction) {
        const location = interaction.options.getString('location');
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

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply({ content: 'Could not fetch weather information. Please check the location name.', ephemeral: true });
        }
    }
};
