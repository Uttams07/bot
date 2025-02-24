
const Economy = require('../database/models/economy');

module.exports = {
    name: 'balance',
    aliases: ['bal', 'money'],
    category: 'Economy',
    description: 'Check your balance',
    async execute(message) {
        const economy = await Economy.findOne({ userId: message.author.id }) || 
            await Economy.create({ userId: message.author.id });
        
        message.reply(`💰 Wallet: $${economy.balance}\n🏦 Bank: $${economy.bank}`);
    }
};
