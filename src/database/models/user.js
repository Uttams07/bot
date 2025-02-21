/*const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    warnings: { type: Number, default: 0 },
    muteEnd: { type: Date, default: null },
    banEnd: { type: Date, default: null },
    joinDate: { type: Date, default: Date.now },
    afk: { type: String, default: null },
    messageCount: { type: Number, default: 0 },
    todayCount: { type: Number, default: 0 },
    yesterdayCount: { type: Number, default: 0 },
    thisWeekCount: { type: Number, default: 0 },
    lastWeekCount: { type: Number, default: 0 },
    thisMonthCount: { type: Number, default: 0 },
    lastMonthCount: { type: Number, default: 0 },
    thisYearCount: { type: Number, default: 0 },
    lastYearCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 },
    textColor: { type: String, default: "#beb1b1" },
    barColor: { type: String, default: "#838383" },
    backgroundColor: { type: String, default: "#36393f" },
});

module.exports = mongoose.model('User', userSchema); */


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    warnings: { type: Number, default: 0 },
    muteEnd: { type: Date, default: null },
    banEnd: { type: Date, default: null },
    joinDate: { type: Date, default: Date.now },
    afk: { type: String, default: null },
    messageCount: { type: Number, default: 0 },
    todayCount: { type: Number, default: 0 },
    yesterdayCount: { type: Number, default: 0 },
    thisWeekCount: { type: Number, default: 0 },
    lastWeekCount: { type: Number, default: 0 },
    thisMonthCount: { type: Number, default: 0 },
    lastMonthCount: { type: Number, default: 0 },
    thisYearCount: { type: Number, default: 0 },
    lastYearCount: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 },
    textColor: { type: String, default: "#beb1b1" },
    barColor: { type: String, default: "#838383" },
    backgroundColor: { type: String, default: "#36393f" }
}); // Explicitly set the collection name

module.exports = mongoose.model('users', userSchema);