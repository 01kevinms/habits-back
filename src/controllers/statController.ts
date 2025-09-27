import { FastifyReply, FastifyRequest } from "fastify";
import { startOfWeek, startOfMonth, endOfMonth, format } from "date-fns";

export const getDailyStats = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (req.user as any).id;
    const todayKey = new Date().toISOString().split("T")[0];

    const allHabits = await req.server.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });

    const totalHabits = allHabits.length;
    const completedToday = allHabits.filter((h) => (h.logs ?? []).some((l: any) => l.dayKey === todayKey && l.status)).length;
    const percent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    return reply.send({ completedToday, totalHabits, percent });
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao buscar estatísticas diárias" });
  }
};

export const getWeeklyStats = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (req.user as any).id;
    const start = startOfWeek(new Date(), { weekStartsOn: 1 });
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    // Pega todos os hábitos e seus logs (pouco custoso para usuários pequenos — ok)
    const allHabits = await req.server.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });
    const totalHabits = allHabits.length;

    const result = days.map((_, i) => {
      const dateObj = new Date(start.getTime() + i * 86400000);
      const dateKey = format(dateObj, "yyyy-MM-dd");

      const completed = allHabits.filter((h) => (h.logs ?? []).some((l: any) => l.dayKey === dateKey && l.status)).length;
      const percent = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
      return { day: days[i], percent };
    });

    return reply.send(result);
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao buscar estatísticas semanais" });
  }
};

export const getMonthlyStats = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (req.user as any).id;
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());

    const allHabits = await req.server.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });

    const totalHabits = allHabits.length;

    // 4 semanas do mês (aprox): média diária por semana
    const weeks = [1, 2, 3, 4];
    const result = weeks.map((week) => {
      const weekStart = new Date(start.getTime() + (week - 1) * 7 * 86400000);
      const weekEnd = new Date(weekStart.getTime() + 6 * 86400000);

      // limitar ao final do mês
      let totalPercent = 0;
      let activeDays = 0;

      for (let d = new Date(weekStart); d <= weekEnd && d <= end; d.setDate(d.getDate() + 1)) {
        const dateKey = format(d, "yyyy-MM-dd");
        const completed = allHabits.filter((h) => (h.logs ?? []).some((l: any) => l.dayKey === dateKey && l.status)).length;
        if (totalHabits > 0) {
          totalPercent += Math.round((completed / totalHabits) * 100);
          activeDays++;
        }
      }

      const percent = activeDays > 0 ? Math.round(totalPercent / activeDays) : 0;
      return { week: `Week ${week}`, percent };
    });

    return reply.send(result);
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao buscar estatísticas mensais" });
  }
};

export const getStreakStats = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const userId = (req.user as any).id;

    const allHabits = await req.server.prisma.habit.findMany({
      where: { userId },
      include: { logs: true },
    });

    const totalHabits = allHabits.length;
    if (totalHabits === 0) {
      return reply.send({ maxStreak: 0, currentStreak: 0 });
    }

    // pegar todos os dias distintos que aparecem em logs
    const allDays = new Set<string>();
    allHabits.forEach((h) => (h.logs ?? []).forEach((l: any) => allDays.add(l.dayKey)));

    const sortedDays = Array.from(allDays).sort();

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate: Date | null = null;

    for (const dayKey of sortedDays) {
      // só conta se todos os hábitos foram feitos nesse dia
      const completedAll = allHabits.every((h) => (h.logs ?? []).some((l: any) => l.dayKey === dayKey && l.status));
      if (!completedAll) {
        currentStreak = 0;
        lastDate = null;
        continue;
      }

      const logDate = new Date(dayKey);
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
  } catch (err) {
    req.server.log.error(err);
    return reply.code(500).send({ error: "Erro ao buscar streaks" });
  }
};
