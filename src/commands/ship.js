/*const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ship',
    description: 'Ship two users together and provide a compatibility score',
    aliases: [],
    category: 'Fun',
    usage: 'ship @user1 @user2',
    async execute(message, args) {
        let user1 = message.mentions.users.first();
        let user2 = message.mentions.users.at(1);

        if (!user1) {
            if (message.reference) {
                user1 = message.author;
                user2 = await message.channel.messages.fetch(message.reference.messageId).then(msg => msg.author);
            } else {
                return message.channel.send('Please mention at least one user to ship.');
            }
        } else if (!user2) {
            user2 = message.author;
        }

        const compatibilityScore = Math.floor(Math.random() * 101);
        const shipName = `${user1.username.slice(0, Math.floor(user1.username.length / 2))}${user2.username.slice(Math.floor(user2.username.length / 2))}`;

        const avatarUrl1 = user1.displayAvatarURL({ format: 'png', size: 512 });
        const avatarUrl2 = user2.displayAvatarURL({ format: 'png', size: 512 });

        const avatarPath1 = await downloadAndConvertImage(avatarUrl1, 'avatar1.png');
        const avatarPath2 = await downloadAndConvertImage(avatarUrl2, 'avatar2.png');

        const imageBuffer = await generateLovelyImage(avatarPath1, avatarPath2, shipName, compatibilityScore);

        const attachment = new AttachmentBuilder(imageBuffer, { name: 'ship.png' });
        message.channel.send({ files: [attachment] });

        // Cleanup downloaded images
        fs.unlinkSync(avatarPath1);
        fs.unlinkSync(avatarPath2);
    },
};

async function downloadAndConvertImage(url, filename) {
    const response = await axios({
        url,
        responseType: 'arraybuffer',
    });
    const filePath = path.resolve(__dirname, filename);
    await sharp(response.data).toFormat('png').toFile(filePath);
    return filePath;
}

async function generateLovelyImage(avatarPath1, avatarPath2, shipName, compatibilityScore) {
    const canvas = createCanvas(680, 219);
    const ctx = canvas.getContext('2d');

    const [avatar1, avatar2, background] = await Promise.all([
        loadImage(avatarPath1),
        loadImage(avatarPath2),
        loadImage(path.resolve(__dirname, 'wallpaper.png')) // Use your local background image file
    ]);

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw circular avatars with more space on both sides
    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 109.5, 65, 0, Math.PI * 2, true); // Updated to 65 radius for 130 diameter
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar1, 30, 44.5, 130, 130); // Adjusted position and size
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(550, 109.5, 65, 0, Math.PI * 2, true); // Updated to 65 radius for 130 diameter
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar2, 530, 44.5, 130, 130); // Adjusted position and size
    ctx.restore();

    // Draw text in the middle
    ctx.fillStyle = '#000000'; // Changed to black
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ship Name', canvas.width / 2, 80);
    ctx.fillText(shipName, canvas.width / 2, 110);
    ctx.fillText('Compatibility Score', canvas.width / 2, 150);
    ctx.fillText(`${compatibilityScore}%`, canvas.width / 2, 180);

    return canvas.toBuffer();
}
*/

/*
const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'ship',
    description: 'Ship two users together and provide a compatibility score',
    aliases: [],
    category: 'Fun',
    usage: 'ship @user1 @user2',
    async execute(message, args) {
        let user1 = message.mentions.users.first();
        let user2 = message.mentions.users.at(1);

        if (!user1) {
            if (message.reference) {
                user1 = message.author;
                user2 = await message.channel.messages.fetch(message.reference.messageId).then(msg => msg.author);
            } else {
                return message.channel.send('Please mention at least one user to ship.');
            }
        } else if (!user2) {
            user2 = message.author;
        }

        const compatibilityScore = Math.floor(Math.random() * 101);
        const shipName = `${user1.username.slice(0, Math.floor(user1.username.length / 2))}${user2.username.slice(Math.floor(user2.username.length / 2))}`;

        const avatarUrl1 = user1.displayAvatarURL({ format: 'png', size: 512 });
        const avatarUrl2 = user2.displayAvatarURL({ format: 'png', size: 512 });

        const avatarPath1 = await downloadAndConvertImage(avatarUrl1, 'avatar1.png');
        const avatarPath2 = await downloadAndConvertImage(avatarUrl2, 'avatar2.png');

        const imageBuffer = await generateLovelyImage(avatarPath1, avatarPath2, shipName, compatibilityScore);

        const attachment = new AttachmentBuilder(imageBuffer, { name: 'ship.png' });
        message.channel.send({ files: [attachment] });

        // Cleanup downloaded images
        fs.unlinkSync(avatarPath1);
        fs.unlinkSync(avatarPath2);
    },
};

async function generateLovelyImage(avatarPath1, avatarPath2, shipName, compatibilityScore) {
    const canvas = createCanvas(680, 219);
    const ctx = canvas.getContext('2d');

    const [avatar1, avatar2, background] = await Promise.all([
        loadImage(avatarPath1),
        loadImage(avatarPath2),
        loadImage(path.resolve(__dirname, 'wallpaper.png'))
    ]);

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw circular avatars with proper centering
    const avatarSize = 130; // Diameter of the circle
    const radius = avatarSize/2;
    
    // First avatar (left)
    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 109.5, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar1, 
        130 - radius,  // x position: center - radius
        109.5 - radius,// y position: center - radius
        avatarSize,    // width
        avatarSize     // height
    );
    ctx.restore();

    // Second avatar (right)
    ctx.save();
    ctx.beginPath();
    ctx.arc(550, 109.5, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar2,
        550 - radius,  // x position: center - radius
        109.5 - radius,// y position: center - radius
        avatarSize,    // width
        avatarSize     // height
    );
    ctx.restore();

    // Rest of the text drawing code remains the same...
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Ship Name', canvas.width / 2, 80);
    ctx.fillText(shipName, canvas.width / 2, 110);
    ctx.fillText('Compatibility Score', canvas.width / 2, 150);
    ctx.fillText(`${compatibilityScore}%`, canvas.width / 2, 180);

    return canvas.toBuffer();
} */

    const { createCanvas, loadImage } = require('canvas');
    const { AttachmentBuilder } = require('discord.js');
    const axios = require('axios');
    const sharp = require('sharp');
    const fs = require('fs');
    const path = require('path');
    
    module.exports = {
        name: 'ship',
        description: 'Ship two users together and provide a compatibility score',
        aliases: [],
        category: 'Fun',
        usage: 'ship @user1 @user2',
        async execute(message, args) {
            let user1 = message.mentions.users.first();
            let user2 = message.mentions.users.at(1);
    
            if (!user1) {
                if (message.reference) {
                    user1 = message.author;
                    user2 = await message.channel.messages.fetch(message.reference.messageId).then(msg => msg.author);
                } else {
                    return message.channel.send('Please mention at least one user to ship.');
                }
            } else if (!user2) {
                user2 = message.author;
            }
    
            const compatibilityScore = Math.floor(Math.random() * 101);
            const shipName = `${user1.username.slice(0, Math.floor(user1.username.length / 2))}${user2.username.slice(Math.floor(user2.username.length / 2))}`;
    
            const avatarUrl1 = user1.displayAvatarURL({ format: 'png', size: 512 });
            const avatarUrl2 = user2.displayAvatarURL({ format: 'png', size: 512 });
    
            const avatarPath1 = await downloadAndConvertImage(avatarUrl1, 'avatar1.png');
            const avatarPath2 = await downloadAndConvertImage(avatarUrl2, 'avatar2.png');
    
            const imageBuffer = await generateLovelyImage(avatarPath1, avatarPath2, shipName, compatibilityScore);
    
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'ship.png' });
            await message.channel.send({ files: [attachment] });
    
            // Cleanup downloaded images
            fs.unlinkSync(avatarPath1);
            fs.unlinkSync(avatarPath2);
        },
    };
    
    /**
     * Downloads and converts an image to PNG format.
     * @param {string} url - The URL of the image to download.
     * @param {string} filename - The name of the file to save.
     * @returns {string} - The path to the saved image.
     */
    async function downloadAndConvertImage(url, filename) {
        const response = await axios({
            url,
            responseType: 'arraybuffer',
        });
        const filePath = path.resolve(__dirname, filename);
        await sharp(response.data).toFormat('png').toFile(filePath);
        return filePath;
    }
    
    /**
     * Generates a lovely ship image with avatars, ship name, and compatibility score.
     * @param {string} avatarPath1 - Path to the first avatar image.
     * @param {string} avatarPath2 - Path to the second avatar image.
     * @param {string} shipName - The generated ship name.
     * @param {number} compatibilityScore - The compatibility score.
     * @returns {Buffer} - The image buffer.
     */
    async function generateLovelyImage(avatarPath1, avatarPath2, shipName, compatibilityScore) {
        const canvas = createCanvas(680, 219);
        const ctx = canvas.getContext('2d');
    
        const [avatar1, avatar2, background] = await Promise.all([
            loadImage(avatarPath1),
            loadImage(avatarPath2),
            loadImage(path.resolve(__dirname, 'wallpaper.png')) // Ensure this file exists
        ]);
    
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    
        // Draw circular avatars with proper centering
        const avatarSize = 125; // Diameter of the circle
        const radius = avatarSize / 2;
    
        // First avatar (left)
        // First avatar (left)
    ctx.save();
    ctx.beginPath();
    ctx.arc(125, 109.5, radius, 0, Math.PI * 2, true); // Move the circle left by 10px
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar1,
        125 - radius,  // Move image left by 10px
        109.5 - radius,     // Keep y position same
        avatarSize,    // Increase width by 10px to prevent right-side cut
        avatarSize          // Keep height same
    );
    ctx.restore();
    
        // Second avatar (right)
        ctx.save();
        ctx.beginPath();
        ctx.arc(555, 109.5, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar2,
            555 - radius,  // x position: center - radius
            109.5 - radius, // y position: center - radius
            avatarSize,    // width
            avatarSize     // height
        );
        ctx.restore();
    
        // Draw text in the middle
        ctx.fillStyle = '#000000'; // Text color
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Ship Name', canvas.width / 2, 80);
        ctx.fillText(shipName, canvas.width / 2, 110);
        ctx.fillText('Compatibility Score', canvas.width / 2, 150);
        ctx.fillText(`${compatibilityScore}%`, canvas.width / 2, 180);
    
        return canvas.toBuffer();
    }
    
    