const Economy = require('../database/models/economy');

module.exports = {
    name: 'deposit',
    description: 'Deposit money into your bank',
    aliases: ['dep'],
    category: 'Economy',
    usage: 'deposit <amount>',
    async execute(message, args) {
        const amount = parseInt(args[0]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('Please enter a valid amount to deposit.');
        }

        let economy = await Economy.findOne({ userId: message.author.id });
        if (!economy) {
            economy = await Economy.create({ userId: message.author.id, balance: 0, bank: 0 });
        }

        if (economy.wallet < amount) {
            return message.reply('You do not have enough money in your wallet to deposit this amount.');
        }

        economy.balance -= amount; // Subtract from wallet
        economy.bank += amount; // Add to bank
        await economy.save();

        message.reply(`✅ You have deposited $${amount} into your bank!`);
    }
};