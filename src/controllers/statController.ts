import { FastifyRequest, FastifyReply } from "fastify";

export const getWeeklyStats = async (req: FastifyRequest, reply: FastifyReply) => {
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

export const getMonthlyStats = async (req: FastifyRequest, reply: FastifyReply) => {
  return [
    { week: "Week 1", percent: 60 },
    { week: "Week 2", percent: 80 },
    { week: "Week 3", percent: 50 },
    { week: "Week 4", percent: 70 },
  ];
};

export const getStreakStats = async (req: FastifyRequest, reply: FastifyReply) => {
  return { maxStreak: 10, currentStreak: 3 };
};
