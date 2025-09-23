"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreakStats = exports.getMonthlyStats = exports.getWeeklyStats = void 0;
const getWeeklyStats = async (req, reply) => {
    return [
        { day: "Mon", percent: 50 },
        { day: "Tue", percent: 70 },
        { day: "Wed", percent: 40 },
        { day: "Thu", percent: 60 },
        { day: "Fri", percent: 90 },
        { day: "Sat", percent: 100 },
        { day: "Sun", percent: 20 },
    ];
};
exports.getWeeklyStats = getWeeklyStats;
const getMonthlyStats = async (req, reply) => {
    return [
        { week: "Week 1", percent: 60 },
        { week: "Week 2", percent: 80 },
        { week: "Week 3", percent: 50 },
        { week: "Week 4", percent: 70 },
    ];
};
exports.getMonthlyStats = getMonthlyStats;
const getStreakStats = async (req, reply) => {
    return { maxStreak: 10, currentStreak: 3 };
};
exports.getStreakStats = getStreakStats;
