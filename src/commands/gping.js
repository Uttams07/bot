const { PermissionsBitField } = require('discord.js'); // ✅ Import PermissionsBitField
const Guild = require('../database/models/guild'); 

module.exports = {
    name: 'greetping',
    description: 'Manage greet pings (add, remove, list, test).',
    aliases: ['gp'],
    category: 'Moderation',
    usage: '<add|remove|list|test> [#channel]',
    async execute(message, args) {
        // ✅ Fix permission flag issue
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply('❌ You need the `Manage Server` permission to use this command.');
        }

        const action = args[0];
        const mentionedChannel = message.mentions.channels.first();
        const guildId = message.guild.id;

        let guildData = await Guild.findOne({ guildID: guildId });

        if (!guildData) {
            guildData = await Guild.create({ guildID: guildId, greetPingChannels: [] });
        }

        if (action === 'add') {
            if (!mentionedChannel) return message.reply('⚠️ Please mention a channel. Usage: `gp add #channel`');
            
            const channelId = mentionedChannel.id;
            if (!guildData.greetPingChannels.includes(channelId)) {
                guildData.greetPingChannels.push(channelId);
                await guildData.save();
                return message.reply(`✅ Greet ping enabled in ${mentionedChannel}.`);
            } else {
                return message.reply(`⚠️ Greet ping is already enabled in ${mentionedChannel}.`);
            }
        } 
        
        else if (action === 'remove') {
            if (!mentionedChannel) return message.reply('⚠️ Please mention a channel. Usage: `gp remove #channel`');

            const channelId = mentionedChannel.id;
            if (guildData.greetPingChannels.includes(channelId)) {
                guildData.greetPingChannels = guildData.greetPingChannels.filter(id => id !== channelId);
                await guildData.save();
                return message.reply(`✅ Greet ping disabled in ${mentionedChannel}.`);
            } else {
                return message.reply(`⚠️ Greet ping is not enabled in ${mentionedChannel}.`);
            }
        } 
        
        else if (action === 'list') {
            if (!guildData || !guildData.greetPingChannels || guildData.greetPingChannels.length === 0) {
                return message.reply('❌ No channels have greet pings enabled.');
            }
            const channelList = guildData.greetPingChannels.map(id => `<#${id}>`).join(', ');
            return message.channel.send(`📜 Greet ping is enabled in the following channels: ${channelList}`);
        } 
        
        else if (action === 'test') {
            if (!guildData || !guildData.greetPingChannels || guildData.greetPingChannels.length === 0) {
                return message.reply('❌ No greet ping channels are configured for this server.');
            }

            const userId = message.author.id;
            for (const channelId of guildData.greetPingChannels) {
                const channel = message.guild.channels.cache.get(channelId);
                if (channel) {
                    const greetMessage = await channel.send(`👋 Welcome <@${userId}>! This is a test greet ping.`);
                    setTimeout(() => greetMessage.delete(), 5000);
                }
            }
            return message.reply('✅ Test greet ping sent! Check the configured channels.');
        } 
        
        else {
            return message.reply('❌ Invalid action! Use:\n' +
                '➜ `gp add #channel` (Enable greet pings)\n' +
                '➜ `gp remove #channel` (Disable greet pings)\n' +
                '➜ `gp list` (Show enabled channels)\n' +
                '➜ `gp test` (Send a test greet ping)');
        }
    },
};
