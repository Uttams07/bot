const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const User = require('../database/models/user');

module.exports = {
    name: 'messagecount',
    description: 'Displays message statistics for a user or shows leaderboards',
    aliases: ['msgcount', 'm'],
    category: 'Utility',
    usage: 'm [@user|userid|lb|leaderboard] [-w|-m|-y|-t]',
    async execute(message, args) {
        const timeFrame = this.determineTimeFrame(args);
        
        if (args[0]?.match(/lb|leaderboard/i)) {
            await this.handleLeaderboard(message, timeFrame);
        } else {
            await this.handleUserStats(message, args);
        }
    },

    determineTimeFrame(args) {
        return args.includes('-w') ? 'weekly' :
               args.includes('-m') ? 'monthly' :
               args.includes('-y') ? 'yesterday' :
               args.includes('-t') ? 'today' : 'allTime';
    },

    async handleLeaderboard(message, timeFrame) {
        const { users, title } = await this.fetchLeaderboardData(timeFrame);
        
        if (!users.length) {
            return message.channel.send('No message data found.');
        }

        const pages = this.createLeaderboardPages(message, users, timeFrame, title);
        await this.sendPaginatedLeaderboard(message, pages);
    },

    async fetchLeaderboardData(timeFrame) {
        let users, title;
        const filter = { $or: [
            { messageCount: { $gt: 0 } },
            { todayCount: { $gt: 0 } },
            { thisWeekCount: { $gt: 0 } }
        ]};

        switch (timeFrame) {
            case 'weekly':
                users = await User.find(filter).sort({ thisWeekCount: -1 }).limit(30);
                title = 'Weekly Message Leaderboard';
                break;
            case 'monthly':
                users = await User.find(filter).sort({ thisMonthCount: -1 }).limit(30);
                title = 'Monthly Message Leaderboard';
                break;
            case 'yesterday':
                users = await User.find(filter).sort({ yesterdayCount: -1 }).limit(30);
                title = "Yesterday's Message Leaderboard";
                break;
            case 'today':
                users = await User.find(filter).sort({ todayCount: -1 }).limit(30);
                title = "Today's Message Leaderboard";
                break;
            default:
                users = await User.find(filter).sort({ messageCount: -1 }).limit(30);
                title = 'All-Time Message Leaderboard';
        }
        return { users, title };
    },

    createLeaderboardPages(message, users, timeFrame, title) {
        const usersPerPage = 10;
        const pageCount = Math.ceil(users.length / usersPerPage);
        const pages = [];

        for (let i = 0; i < pageCount; i++) {
            const start = i * usersPerPage;
            const end = start + usersPerPage;
            const leaderboard = users.slice(start, end)
                .map((user, index) => {
                    const count = this.getCountForTimeFrame(user, timeFrame);
                    const userTag = message.guild.members.cache.get(user.userID)?.user.tag || 'Unknown User';
                    return `${start + index + 1}. ${userTag}: ${count.toLocaleString()}`;
                })
                .join('\n');

            pages.push(new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle(title)
                .setDescription(leaderboard || 'No data available')
                .setFooter({ text: `Page ${i + 1} of ${pageCount} • Daily reset at UTC 00:00` })
                .setTimestamp());
        }
        return pages;
    },

    getCountForTimeFrame(user, timeFrame) {
        switch (timeFrame) {
            case 'weekly': return user.thisWeekCount;
            case 'monthly': return user.thisMonthCount;
            case 'yesterday': return user.yesterdayCount;
            case 'today': return user.todayCount;
            default: return user.messageCount;
        }
    },

    async sendPaginatedLeaderboard(message, pages) {
        if (!pages.length) return;

        let currentPage = 0;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
        );

        const msg = await message.channel.send({
            embeds: [pages[currentPage]],
            components: [row]
        });

        const collector = msg.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 60000,
            componentType: ComponentType.Button
        });

        collector.on('collect', async i => {
            currentPage = i.customId === 'previous' 
                ? (currentPage > 0 ? currentPage - 1 : pages.length - 1)
                : (currentPage < pages.length - 1 ? currentPage + 1 : 0);

            await i.update({ embeds: [pages[currentPage]] });
        });

        collector.on('end', () => {
            row.components.forEach(c => c.setDisabled(true));
            msg.edit({ components: [row] });
        });
    },

    async handleUserStats(message, args) {
        const targetUser = message.mentions.users.first() || 
                         message.guild.members.cache.get(args[0])?.user || 
                         message.author;

        const user = await User.findOne({ userID: targetUser.id });
        if (!user) return message.channel.send('No message data found.');

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle(`${targetUser.tag}'s Message Statistics`)
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { 
                    name: '📊 Current Periods', 
                    value: `• Today: ${user.todayCount.toLocaleString()}\n` +
                           `• This Week: ${user.thisWeekCount.toLocaleString()}\n` +
                           `• This Month: ${user.thisMonthCount.toLocaleString()}\n` +
                           `• This Year: ${user.thisYearCount.toLocaleString()}`,
                    inline: true 
                },
                { 
                    name: '📅 Previous Periods', 
                    value: `• Yesterday: ${user.yesterdayCount.toLocaleString()}\n` +
                           `• Last Week: ${user.lastWeekCount.toLocaleString()}\n` +
                           `• Last Month: ${user.lastMonthCount.toLocaleString()}\n` +
                           `• Last Year: ${user.lastYearCount.toLocaleString()}`,
                    inline: true 
                },
                { 
                    name: '🏆 All-Time Total', 
                    value: `${user.messageCount.toLocaleString()} messages`,
                    inline: false 
                }
            )
            .setFooter({ text: 'Daily reset occurs at UTC 00:00' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
};