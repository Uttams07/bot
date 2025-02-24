
const Economy = require('../database/models/economy');

module.exports = {
    name: 'daily',
    category: 'Economy',
    description: 'Collect daily rewards',
    async execute(message) {
        const reward = 100;
        const cooldown = 24 * 60 * 60 * 1000; // 24 hours
        
        let economy = await Economy.findOne({ userId: message.author.id });
        if (!economy) economy = await Economy.create({ userId: message.author.id });
        
        if (economy.lastDaily && Date.now() - economy.lastDaily < cooldown) {
            const timeLeft = cooldown - (Date.now() - economy.lastDaily);
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            return message.reply(`⏰ You can collect your daily reward in ${hoursLeft} hours`);
        }
        
        economy.balance += reward;
        economy.lastDaily = Date.now();
        await economy.save();
        
        message.reply(`✅ You collected your daily reward of $${reward}!`);
    }
};
