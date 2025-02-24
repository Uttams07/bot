
const Economy = require('../database/models/economy');

module.exports = {
    name: 'work',
    category: 'Economy',
    description: 'Work to earn money',
    async execute(message) {
        const cooldown = 30 * 60 * 1000; // 30 minutes
        const reward = Math.floor(Math.random() * 50) + 50; // 50-100 coins
        
        let economy = await Economy.findOne({ userId: message.author.id });
        if (!economy) economy = await Economy.create({ userId: message.author.id });
        
        if (economy.lastWork && Date.now() - economy.lastWork < cooldown) {
            const timeLeft = cooldown - (Date.now() - economy.lastWork);
            const minutesLeft = Math.floor(timeLeft / (60 * 1000));
            return message.reply(`⏰ You can work again in ${minutesLeft} minutes`);
        }
        
        economy.balance += reward;
        economy.lastWork = Date.now();
        await economy.save();
        
        message.reply(`💼 You worked and earned $${reward}!`);
    }
};
