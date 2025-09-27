import { FastifyReply, FastifyRequest } from "fastify";

interface NewHabitBody {
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "monthly";
}

function getTodayKey() {
  return new Date().toISOString().split("T")[0];
}

/**
 * GET /habits
 * Lista hábitos do usuário com logs e todayStatus
 */
export const getHabits = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (req.user as any).id;
    const todayKey = getTodayKey();

    const habits = await req.server.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
      orderBy: { createdAt: "desc" },
    });

    const res = habits.map((h) => {
      const todayStatus = h.logs.some((l) => l.dayKey === todayKey && l.status);
      return {
        id: h.id,
        title: h.title,
        description: h.description,
        frequency: h.frequency,
        userId: h.userId,
        createdAt: h.createdAt,
        logs: h.logs ?? [], // sempre array
        todayStatus,        // sempre boolean
      };
    });

    return reply.send(res);
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao buscar hábitos" });
  }
};

/**
 * POST /habits
 * Cria um novo hábito
 */
export const createHabit = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (req.user as any).id;
    const { title, description, frequency } = req.body as NewHabitBody;

    const created = await req.server.prisma.habit.create({
      data: { title, description, frequency, userId },
    });

    return reply.code(201).send({
      id: created.id,
      title: created.title,
      description: created.description,
      frequency: created.frequency,
      userId: created.userId,
      createdAt: created.createdAt,
      logs: [],            // sempre array
      todayStatus: false,  // sempre boolean
    });
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao criar hábito" });
  }
};

/**
 * DELETE /habits/:id
 * Remove hábito e seus logs
 */
export const deleteHabit = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };

    await req.server.prisma.habitLog.deleteMany({ where: { habitId: id } });
    await req.server.prisma.habit.delete({ where: { id } });

    return reply.send({ success: true });
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao deletar hábito" });
  }
};

/**
 * PATCH /habits/:id/toggle
 * Marca ou desmarca hábito no dia atual
 */
export const toggleHabitLog = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { id } = req.params as { id: string };
    const userId = (req.user as any).id;
    const todayKey = getTodayKey();

    const existing = await req.server.prisma.habitLog.findUnique({
      where: { habitId_dayKey: { habitId: id, dayKey: todayKey } },
    });

    if (existing) {
      await req.server.prisma.habitLog.delete({ where: { id: existing.id } });
    } else {
      await req.server.prisma.habitLog.create({
        data: { habitId: id, dayKey: todayKey, status: true },
      });
    }

    const habit = await req.server.prisma.habit.findUnique({
      where: { id },
      include: { logs: true },
    });

    if (!habit) {
      return reply.code(404).send({ error: "Hábito não encontrado" });
    }

    const todayStatus = habit.logs.some((l) => l.dayKey === todayKey && l.status);

    const allHabits = await req.server.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });

    const totalHabits = allHabits.length;
    const completedToday = allHabits.filter((h) =>
      h.logs.some((l) => l.dayKey === todayKey && l.status)
    ).length;
    const percent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return reply.send({
      habit: {
        id: habit.id,
        title: habit.title,
        description: habit.description,
        frequency: habit.frequency,
        userId: habit.userId,
        createdAt: habit.createdAt,
        logs: habit.logs ?? [],
        todayStatus,
      },
      stats: { completedToday, totalHabits, percent },
    });
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao alternar log do hábito" });
  }
};
