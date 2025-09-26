import { FastifyReply, FastifyRequest } from "fastify";
import { startOfWeek, startOfMonth, endOfMonth, format } from "date-fns";



export const getWeeklyStats = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = req.user.id;
    const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // segunda

    // pega todos os hábitos do usuário + todos os logs da semana
    const allHabits = await req.server.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });

    const totalHabits = allHabits.length;
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const result = days.map((day, i) => {
      const dateKey = format(new Date(start.getTime() + i * 86400000), "yyyy-MM-dd");

      const completed = allHabits.filter(h =>
        h.logs.some(l => l.dayKey === dateKey && l.status)
      ).length;

      const percent = totalHabits > 0
        ? Math.round((completed / totalHabits) * 100)
        : 0;
      console.log("Count🚀:", completed, "Percent🚀:", percent);
      return { day, percent };
    });

    return reply.send(result);
  } catch (error) {
    req.server.log.error(error);
    return reply.code(500).send({ error: "Erro ao buscar estatísticas semanais" });
  }
};

export const getMonthlyStats = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = req.user.id;
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const allHabits = await req.server.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });

    const totalHabits = allHabits.length;

    // 4 semanas do mês (aprox)
    const result = [1, 2, 3, 4].map((week) => {
      // pega todos os dias dessa semana
      const weekStart = new Date(start.getTime() + (week - 1) * 7 * 86400000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

      let totalPercent = 0;
      let activeDays = 0;

      for (let d = weekStart; d <= weekEnd && d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = format(d, "yyyy-MM-dd");

        const completed = allHabits.filter(h =>
          h.logs.some(l => l.dayKey === dateKey && l.status)
        ).length;

        if (totalHabits > 0) {
          totalPercent += Math.round((completed / totalHabits) * 100);
          activeDays++;
        }
      }

      const percent = activeDays > 0
        ? Math.round(totalPercent / activeDays)
        : 0;

      return { week: `Week ${week}`, percent };
    });

    return reply.send(result);
  } catch (error) {
    req.server.log.error(error);
    return reply.code(500).send({ error: "Erro ao buscar estatísticas mensais" });
  }
};

export const getStreakStats = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = req.user.id;

    // busca todos os hábitos e seus logs
    const allHabits = await req.server.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });

    const totalHabits = allHabits.length;
    if (totalHabits === 0) {
      return reply.send({ maxStreak: 0, currentStreak: 0 });
    }

    // pega todos os dias distintos que o usuário marcou logs
    const allDays = new Set<string>();
    allHabits.forEach(habit =>
      habit.logs.forEach(l => allDays.add(l.dayKey))
    );

    // ordena as datas
    const sortedDays = Array.from(allDays).sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const dayKey of sortedDays) {
      const logDate = new Date(dayKey);

      // checa se TODOS os hábitos foram feitos nesse dia
      const completedAll = allHabits.every(h =>
        h.logs.some(l => l.dayKey === dayKey && l.status)
      );

      if (!completedAll) {
        currentStreak = 0;
        lastDate = null;
        continue;
      }

      if (lastDate) {
        const diff = (logDate.getTime() - lastDate.getTime()) / 86400000;
        currentStreak = diff === 1 ? currentStreak + 1 : 1;
      } else {
        currentStreak = 1;
      }

      lastDate = logDate;
      maxStreak = Math.max(maxStreak, currentStreak);
    }

    return reply.send({ maxStreak, currentStreak });
  } catch (error) {
    req.server.log.error(error);
    return reply.code(500).send({ error: "Erro ao buscar streak" });
  }
};

export async function getDailyStats(req: FastifyRequest, reply: FastifyReply) {
  const userId = req.user.id; // vem do authGuard
  const todayKey = new Date().toISOString().split("T")[0];
  const allHabits = await req.server.prisma.habit.findMany({
    where: { userId },
    include: { logs: { where: { dayKey: todayKey } } },
  });

  const totalHabits = allHabits.length;
  const completedToday = allHabits.filter(h => h.logs.length > 0).length;
  const percent = totalHabits > 0
    ? Math.round((completedToday / totalHabits) * 100)
    : 0;

  return reply.send({ completedToday, totalHabits, percent });
}
