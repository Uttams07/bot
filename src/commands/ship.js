const { createCanvas, loadImage } = require("canvas");
const { AttachmentBuilder } = require("discord.js");
const axios = require("axios");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const Economy = require("../database/models/economy"); // Ensure this path is correct

module.exports = {
    name: "ship",
    description: "Ship two users together and provide a compatibility score",
    aliases: [],
    category: "Fun",
    usage: "ship @user1 @user2",
    async execute(message, args) {
        let user1 = message.mentions.users.first();
        let user2 = message.mentions.users.at(1);

        if (!user1) {
            if (message.reference) {
                user1 = message.author;
                user2 = await message.channel.messages
                    .fetch(message.reference.messageId)
                    .then((msg) => msg.author);
            } else {
                return message.channel.send(
                    "Please mention at least one user to ship.",
                );
            }
        } else if (!user2) {
            user2 = message.author;
        }

        // Check user economy and deduct 1000 coins for using the command
        let economy = await Economy.findOne({ userId: message.author.id });
        if (!economy) {
            economy = await Economy.create({
                userId: message.author.id,
                balance: 0,
                bank: 0,
            });
        }

        if (economy.balance < 1) {
            return message.reply(
                "You do not have 1 coin to use this command. Claim `Daily` or Use `Work` to get coins, check balance with `love bal`.",
            );
        }

        // Deduct 1 coins
        economy.balance -= 1;
        await economy.save();

        const compatibilityScore = Math.floor(Math.random() * 101);
        const shipName = `${user1.username.slice(0, Math.floor(user1.username.length / 2))}${user2.username.slice(Math.floor(user2.username.length / 2))}`;

        const avatarUrl1 = user1.displayAvatarURL({ format: "png", size: 512 });
        const avatarUrl2 = user2.displayAvatarURL({ format: "png", size: 512 });

        const avatarPath1 = await downloadAndConvertImage(
            avatarUrl1,
            "avatar1.png",
        );
        const avatarPath2 = await downloadAndConvertImage(
            avatarUrl2,
            "avatar2.png",
        );

        const imageBuffer = await generateLovelyImage(
            avatarPath1,
            avatarPath2,
            shipName,
            compatibilityScore,
        );

        const attachment = new AttachmentBuilder(imageBuffer, {
            name: "ship.png",
        });
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
        responseType: "arraybuffer",
    });
    const filePath = path.resolve(__dirname, filename);
    await sharp(response.data).toFormat("png").toFile(filePath);
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
async function generateLovelyImage(
    avatarPath1,
    avatarPath2,
    shipName,
    compatibilityScore,
) {
    const canvas = createCanvas(680, 219);
    const ctx = canvas.getContext("2d");

    const [avatar1, avatar2, background] = await Promise.all([
        loadImage(avatarPath1),
        loadImage(avatarPath2),
        loadImage(path.resolve(__dirname, "wallpaper.png")), // Ensure this file exists
    ]);

    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    const avatarSize = 130; // Diameter of the circle
    const radius = avatarSize / 2;

    // First avatar (left)
    ctx.save();
    ctx.beginPath();
    ctx.arc(130, 109.5, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
        avatar1,
        130 - radius,
        109.5 - radius,
        avatarSize,
        avatarSize,
    );
    ctx.restore();

    // Second avatar (right)
    ctx.save();
    ctx.beginPath();
    ctx.arc(550, 109.5, radius, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
        avatar2,
        550 - radius,
        109.5 - radius,
        avatarSize,
        avatarSize,
    );
    ctx.restore();

    // Draw text in the middle
    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Ship Name", canvas.width / 2, 80);
    ctx.fillText(shipName, canvas.width / 2, 110);
    ctx.fillText("Compatibility Score", canvas.width / 2, 150);
    ctx.fillText(`${compatibilityScore}%`, canvas.width / 2, 180);

    return canvas.toBuffer();
}