/*const { Events, EmbedBuilder } = require('discord.js');
const Guild = require('../database/models/guild');
const User = require('../database/models/user');
const moment = require('moment-timezone');

module.exports = (client) => {
    client.prefixCache = new Map();
    client.guildCache = new Map();

    // Guild data caching
    const fetchGuildData = async (guildId) => {
        try {
            const guildData = await Guild.findOne({ guildID: guildId }) || 
                new Guild({ guildID: guildId, prefix: 'Love Cafe' });
            
            client.prefixCache.set(guildId, guildData.prefix);
            client.guildCache.set(guildId, guildData);
            
            return guildData;
        } catch {
            return { prefix: 'Love Cafe' };
        }
    };

    // AFK system
    async function handleAfkRemoval(message) {
        try {
            await User.updateOne({ userID: message.author.id }, { $unset: { afk: '' } });
            
            if (message.member.manageable) {
                const newNickname = message.member.displayName.replace(/\[AFK\]\s*/ /*-<remove i, '');
                await message.member.setNickname(newNickname);
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`${message.author}, welcome back! AFK status removed.`);
            
            await message.channel.send({ embeds: [embed] });
        } catch {}
    }

    // Statistics tracking
    async function updateUserStats(userId) {
        try {
            const now = moment.tz('Asia/Kolkata');
            const user = await User.findOne({ userID: userId }) || 
                new User({ userID: userId });

            if (user.lastUpdated) {
                const lastUpdate = moment(user.lastUpdated).tz('Asia/Kolkata');
                if (!lastUpdate.isSame(now, 'day')) {
                    user.yesterdayCount = user.todayCount;
                    user.todayCount = 0;
                    user.lastUpdated = now.toDate();
                }
            }

            user.messageCount = (user.messageCount || 0) + 1;
            user.todayCount = (user.todayCount || 0) + 1;
            await user.save();
        } catch {}
    }

    // Main misc handler
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot || !message.guild) return;

        // Update prefix cache
        if (!client.prefixCache.has(message.guild.id)) {
            await fetchGuildData(message.guild.id);
        }

        // Handle AFK
        const userData = await User.findOne({ userID: message.author.id });
        if (userData?.afk) await handleAfkRemoval(message);

        // Update statistics
        await updateUserStats(message.author.id);

        // Bot mention response
        if (message.mentions.has(client.user) && !message.reference) {
            const prefix = client.prefixCache.get(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`My prefix is \`${prefix}\``);
            await message.channel.send({ embeds: [embed] });
        }
    });
}; */


const { Events, EmbedBuilder } = require('discord.js');
const Guild = require('../database/models/guild');
const User = require('../database/models/user');
const moment = require('moment-timezone');

module.exports = (client) => {
    client.prefixCache = new Map();
    client.guildCache = new Map();
    client.snipes = new Map(); // Store deleted messages for the snipe command

    // Guild data caching
    const fetchGuildData = async (guildId) => {
        try {
            const guildData = await Guild.findOne({ guildID: guildId }) || 
                new Guild({ guildID: guildId, prefix: 'test' });
            
            client.prefixCache.set(guildId, guildData.prefix);
            client.guildCache.set(guildId, guildData);
            
            return guildData;
        } catch {
            return { prefix: 'test' };
        }
    };

    // AFK system
    async function handleAfkRemoval(message) {
        try {
            await User.updateOne({ userID: message.author.id }, { $unset: { afk: '' } });
            
            if (message.member.manageable) {
                const newNickname = message.member.displayName.replace(/\[AFK\]\s*/i, '');
                await message.member.setNickname(newNickname);
            }

            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`${message.author}, welcome back! AFK status removed.`);
            
            await message.channel.send({ embeds: [embed] });
        } catch {}
    }

   // Update user statistics (unchanged)
   async function updateUserStats(userId) {
    try {
        const now = moment.utc();
        const user = await User.findOne({ userID: userId }) || new User({ userID: userId });
        const lastUpdate = user.lastUpdated ? moment.utc(user.lastUpdated) : null;

        if (lastUpdate) {
            if (!lastUpdate.isSame(now, 'day')) {
                user.yesterdayCount = user.todayCount;
                user.todayCount = 0;

                if (now.day() === 1 && !lastUpdate.isSame(now, 'week')) {
                    user.lastWeekCount = user.thisWeekCount;
                    user.thisWeekCount = 0;
                }

                if (now.date() === 1 && !lastUpdate.isSame(now, 'month')) {
                    user.lastMonthCount = user.thisMonthCount;
                    user.thisMonthCount = 0;
                }

                if (now.month() === 0 && now.date() === 1 && !lastUpdate.isSame(now, 'year')) {
                    user.lastYearCount = user.thisYearCount;
                    user.thisYearCount = 0;
                }
            }

            user.lastUpdated = now.toDate();
        } else {
            user.lastUpdated = now.toDate();
        }

        user.messageCount += 1;
        user.todayCount += 1;
        user.thisWeekCount += 1;
        user.thisMonthCount += 1;
        user.thisYearCount += 1;

        await user.save();
    } catch (err) {
        console.error('Error updating user stats:', err);
    }
}

    // Main misc handler
    client.on(Events.MessageCreate, async (message) => {
        if (message.author.bot || !message.guild) return;

        // Update prefix cache
        if (!client.prefixCache.has(message.guild.id)) {
            await fetchGuildData(message.guild.id);
        }

        // Handle AFK
        const userData = await User.findOne({ userID: message.author.id });
        if (userData?.afk) await handleAfkRemoval(message);

        // Update statistics
        await updateUserStats(message.author.id);

        // Bot mention response
        if (message.mentions.has(client.user) && !message.reference) {
            const prefix = client.prefixCache.get(message.guild.id);
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setDescription(`My prefix is \`${prefix}\``);
            await message.channel.send({ embeds: [embed] });
        }
    });

    // Snipe feature (Stores deleted messages permanently)
    client.on(Events.MessageDelete, async (message) => {
        if (!message.partial && message.author) {
            client.snipes.set(message.channel.id, {
                content: message.content || 'No content',
                author: {
                    id: message.author.id,
                    tag: message.author.tag,
                    avatar: message.author.displayAvatarURL({ dynamic: true }) // Store avatar URL separately
                },
                timestamp: message.createdTimestamp,
            });
        }
    });
};
// Compare this snippet from bl-ai/src/commands/snipe.js:
