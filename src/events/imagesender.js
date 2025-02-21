/*const { EmbedBuilder, Client } = require('discord.js');
const axios = require('axios');

// Queue to store sent image URLs
const sentImages = new Set();
const UNSPLASH_ACCESS_KEY = 'aY6U7Bno-rcDVaq-tIz53ZQZEqynnCRRcBZbD5fsKvQ'; // Replace with your Unsplash API key

// Function to fetch a unique image of a boy's face
const fetchUniqueImage = async () => {
    try {
        let imageUrl;
        let attempts = 0;

        do {
            // Search Unsplash for boy face images
            const response = await axios.get('https://api.unsplash.com/search/photos', {
                headers: {
                    Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
                },
                params: {
                    query: 'girl',
                    orientation: 'portrait',
                    per_page: 30  // Get more results to reduce duplicates
                }
            });

            const results = response.data.results;
            if (results.length === 0) throw new Error('No images found');

            // Select a random image from results
            const randomImage = results[Math.floor(Math.random() * results.length)];
            imageUrl = randomImage.urls.regular;
            
            attempts++;
            if (attempts > 5) throw new Error('Failed to find unique image after 5 attempts');

        } while (sentImages.has(imageUrl));

        sentImages.add(imageUrl);
        return imageUrl;

    } catch (error) {
        console.error('Error fetching image from Unsplash:', error);
        throw error;
    }
};

// Function to send image to Discord
const sendRandomImage = async (channel) => {
    try {
        const imageUrl = await fetchUniqueImage();
        
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('Random Girls pfp')
            .setImage(imageUrl)
            .setFooter({ 
                text: 'Powered by Love Cafe',
                iconURL: ''
            });

        await channel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error sending image:', error);
    }
};

// Start image sender
const startImageSender = (client, channelId, interval = 60000) => { // 60-second interval
    const channel = client.channels.cache.get(channelId);
    
    if (!channel) {
        console.error('Channel not found');
        return;
    }

    setInterval(async () => {
        await sendRandomImage(channel);
    }, interval);

    console.log(`Started sending images to ${channel.name} every ${interval/1000} seconds`);
};

module.exports = (client) => {
    const CHANNEL_ID = '1340688242642780300'; // Your channel ID
    
    client.once('ready', () => {
        startImageSender(client, CHANNEL_ID, 1000000000000); // 60-second interval
    });
};*/