"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleHabitLog = exports.deleteHabit = exports.createHabit = exports.getHabits = void 0;
const getHabits = async (req, reply) => {
    const userId = req.user.id;
    const today = new Date().toISOString().split("T")[0];
    const habits = await req.server.prisma.habit.findMany({
        where: { userId },
        include: { logs: { where: { dayKey: today } } },
    });
    return habits.map((h) => ({
        id: h.id,
        title: h.title,
        description: h.description,
        frequency: h.frequency,
        todayStatus: h.logs.length > 0,
    }));
};
exports.getHabits = getHabits;
const createHabit = async (req, reply) => {
    const { title, description, frequency } = req.body;
    return req.server.prisma.habit.create({
        data: { title, description, frequency, userId: req.user.id },
    });
};
exports.createHabit = createHabit;
const deleteHabit = async (req, reply) => {
    const { id } = req.params;
    await req.server.prisma.habit.delete({ where: { id } });
    return { success: true };
};
exports.deleteHabit = deleteHabit;
const toggleHabitLog = async (req, reply) => {
    const { id } = req.params;
    const today = new Date().toISOString().split("T")[0];
    const existing = await req.server.prisma.habitLog.findUnique({
        where: { habitId_dayKey: { habitId: id, dayKey: today } },
    });
    if (existing) {
        await req.server.prisma.habitLog.delete({ where: { id: existing.id } });
    }
    else {
        await req.server.prisma.habitLog.create({ data: { habitId: id, dayKey: today } });
    }
    const habit = await req.server.prisma.habit.findUnique({
        where: { id },
        include: { logs: true },
    });
    if (!habit)
        throw new Error("Hábito não encontrado");
    const todayStatus = habit.logs.some((log) => log.dayKey === today);
    return {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
        todayStatus,
    };
};
exports.toggleHabitLog = toggleHabitLog;
