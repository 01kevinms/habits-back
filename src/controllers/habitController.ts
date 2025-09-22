import { FastifyReply, FastifyRequest } from "fastify";

interface NewHabit {
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
}

export const getHabits = async (req: FastifyRequest, reply: FastifyReply) => {
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

export const createHabit = async (req: FastifyRequest, reply: FastifyReply) => {
  const { title, description, frequency } = req.body as NewHabit;
  return req.server.prisma.habit.create({
    data: { title, description, frequency, userId: req.user.id },
  });
};

export const deleteHabit = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  await req.server.prisma.habit.delete({ where: { id } });
  return { success: true };
};

export const toggleHabitLog = async (req: FastifyRequest, reply: FastifyReply) => {
  const { id } = req.params as { id: string };
  const today = new Date().toISOString().split("T")[0];

  const existing = await req.server.prisma.habitLog.findUnique({
    where: { habitId_dayKey: { habitId: id, dayKey: today } },
  });

  if (existing) {
    await req.server.prisma.habitLog.delete({ where: { id: existing.id } });
  } else {
    await req.server.prisma.habitLog.create({ data: { habitId: id, dayKey: today } });
  }

  const habit = await req.server.prisma.habit.findUnique({
    where: { id },
    include: { logs: true },
  });

  if (!habit) throw new Error("Hábito não encontrado");

  const todayStatus = habit.logs.some((log) => log.dayKey === today);

  return {
    id: habit.id,
    title: habit.title,
    description: habit.description,
    frequency: habit.frequency,
    todayStatus,
  };
};
