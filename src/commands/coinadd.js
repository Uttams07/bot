const { PermissionsBitField } = require("discord.js"); // Import PermissionsBitField for permission checks
const Economy = require("../database/models/economy"); // Ensure this path is correct

module.exports = {
    name: "coinadd",
    description: "Add coins to a user's bank balance (Admin Only)",
    aliases: ["addcoins"],
    category: "Admin",
    usage: "coinadd @user <amount>",
    async execute(message, args) {
        // Check if the user has administrator permissions
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("You do not have permission to use this command.");
        }

        // Get the mentioned user and the amount to add
        const targetUser = message.mentions.users.first();
        const amount = parseInt(args[1]);

        // Validate the input
        if (!targetUser) {
            return message.reply("Please mention a user to add coins to.");
        }
        if (isNaN(amount) || amount <= 0) {
            return message.reply("Please provide a valid amount of coins to add.");
        }

        // Find or create the user's economy profile
        let economy = await Economy.findOne({ userId: targetUser.id });
        if (!economy) {
            economy = await Economy.create({
                userId: targetUser.id,
                balance: 0,
                bank: 0,
            });
        }

        // Add the specified amount to the user's bank
        economy.bank += amount;
        await economy.save();

        // Send a confirmation message
        message.reply(`Successfully added **${amount} coins** to ${targetUser.username}'s bank. Their new bank balance is **${economy.bank} coins**.`);
    },
};