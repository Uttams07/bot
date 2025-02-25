const Economy = require('../database/models/economy');

module.exports = {
    name: 'withdraw',
    description: 'Withdraw money from your bank to your wallet',
    aliases: ['with'],
    category: 'Economy',
    usage: 'withdraw <amount>',
    async execute(message, args) {
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Please enter a valid amount to withdraw.');
        }

        let economy = await Economy.findOne({ userId: message.author.id });
        if (!economy) {
            economy = await Economy.create({ userId: message.author.id, balance: 0, bank: 0 });
        }

        if (economy.bank < amount) {
            return message.reply('You do not have enough money in your bank to withdraw this amount.');
        }

        economy.bank -= amount; // Subtract from bank
        economy.balance += amount; // Add to wallet
        await economy.save();

        message.reply(`✅ You have withdrawn $${amount} into your wallet!`);
    }
};