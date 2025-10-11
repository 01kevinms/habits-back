"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreakStats = exports.getMonthlyStats = exports.getWeeklyStats = exports.getDailyStats = void 0;
// Funções de manipulação de datas do date-fns
const date_fns_1 = require("date-fns");
const getDailyStats = async (req, reply) => {
    try {
        const userId = req.user.id; // ID do usuário autenticado
        const todayKey = new Date().toISOString().split("T")[0]; // Data de hoje (YYYY-MM-DD)
        // Busca todos os hábitos do usuário incluindo logs
        const allHabits = await req.server.prisma.habit.findMany({
            where: { userId },
            include: { logs: true },
        });
        const totalHabits = allHabits.length; // Total de hábitos cadastrados
        // Conta quantos hábitos foram concluídos hoje
        const completedToday = allHabits.filter((h) => (h.logs ?? []).some((l) => l.dayKey === todayKey && l.status)).length;
        // Calcula percentual de hábitos concluídos hoje
        const percent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        return reply.send({ completedToday, totalHabits, percent });
    }
    catch (err) {
        req.server.log.error(err);
        return reply.code(500).send({ error: "Erro ao buscar estatísticas diárias" });
    }
};
exports.getDailyStats = getDailyStats;
/**
 * Estatísticas semanais: percentual diário de hábitos concluídos
 */
const getWeeklyStats = async (req, reply) => {
    try {
        const userId = req.user.id;
        const start = (0, date_fns_1.startOfWeek)(new Date(), { weekStartsOn: 1 }); // Início da semana (segunda-feira)
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // Dias da semana
        // Busca todos os hábitos do usuário com logs
        const allHabits = await req.server.prisma.habit.findMany({
            where: { userId },
            include: { logs: true },
        });
        const totalHabits = allHabits.length;
        // Calcula percentual de conclusão para cada dia da semana
        const result = days.map((_, i) => {
            const dateObj = new Date(start.getTime() + i * 86400000); // Dia da semana
            const dateKey = (0, date_fns_1.format)(dateObj, "yyyy-MM-dd"); // Formato YYYY-MM-DD
            // Conta hábitos concluídos naquele dia
            const completed = allHabits.filter((h) => (h.logs ?? []).some((l) => l.dayKey === dateKey && l.status)).length;
            const percent = totalHabits > 0 ? Math.round((completed / totalHabits) * 100) : 0;
            return { day: days[i], percent };
        });
        return reply.send(result);
    }
    catch (err) {
        req.server.log.error(err);
        return reply.code(500).send({ error: "Erro ao buscar estatísticas semanais" });
    }
};
exports.getWeeklyStats = getWeeklyStats;
/**
 * Estatísticas mensais: percentual médio por semana
 */
const getMonthlyStats = async (req, reply) => {
    try {
        const userId = req.user.id;
        const start = (0, date_fns_1.startOfMonth)(new Date()); // Início do mês
        const end = (0, date_fns_1.endOfMonth)(new Date()); // Fim do mês
        // Busca todos os hábitos do usuário com logs
        const allHabits = await req.server.prisma.habit.findMany({
            where: { userId },
            include: { logs: true },
        });
        const totalHabits = allHabits.length;
        // Considera 4 semanas no mês (aprox.)
        const weeks = [1, 2, 3, 4];
        const result = weeks.map((week) => {
            const weekStart = new Date(start.getTime() + (week - 1) * 7 * 86400000); // Início da semana
            const weekEnd = new Date(weekStart.getTime() + 6 * 86400000); // Fim da semana
            let totalPercent = 0; // Soma dos percentuais diários
            let activeDays = 0; // Dias válidos da semana
            // Calcula percentual diário para cada dia da semana
            for (let d = new Date(weekStart); d <= weekEnd && d <= end; d.setDate(d.getDate() + 1)) {
                const dateKey = (0, date_fns_1.format)(d, "yyyy-MM-dd");
                const completed = allHabits.filter((h) => (h.logs ?? []).some((l) => l.dayKey === dateKey && l.status)).length;
                if (totalHabits > 0) {
                    totalPercent += Math.round((completed / totalHabits) * 100);
                    activeDays++;
                }
            }
            // Percentual médio da semana
            const percent = activeDays > 0 ? Math.round(totalPercent / activeDays) : 0;
            return { week: `Week ${week}`, percent };
        });
        return reply.send(result);
    }
    catch (err) {
        req.server.log.error(err);
        return reply.code(500).send({ error: "Erro ao buscar estatísticas mensais" });
    }
};
exports.getMonthlyStats = getMonthlyStats;
/**
 * Streaks: maior sequência de dias consecutivos com todos os hábitos concluídos
 */
const getStreakStats = async (req, reply) => {
    try {
        const userId = req.user.id;
        // Busca todos os hábitos do usuário com logs
        const allHabits = await req.server.prisma.habit.findMany({
            where: { userId },
            include: { logs: true },
        });
        const totalHabits = allHabits.length;
        if (totalHabits === 0) {
            return reply.send({ maxStreak: 0, currentStreak: 0 });
        }
        // Coleta todos os dias distintos que possuem logs
        const allDays = new Set();
        allHabits.forEach((h) => (h.logs ?? []).forEach((l) => allDays.add(l.dayKey)));
        const sortedDays = Array.from(allDays).sort(); // Ordena os dias
        let maxStreak = 0; // Maior sequência de dias consecutivos
        let currentStreak = 0; // Sequência atual
        let lastDate = null;
        for (const dayKey of sortedDays) {
            // Conta apenas se todos os hábitos foram completados nesse dia
            const completedAll = allHabits.every((h) => (h.logs ?? []).some((l) => l.dayKey === dayKey && l.status));
            if (!completedAll) {
                currentStreak = 0;
                lastDate = null;
                continue;
            }
            const logDate = new Date(dayKey);
            if (lastDate) {
                const diff = (logDate.getTime() - lastDate.getTime()) / 86400000; // Diferença em dias
                currentStreak = diff === 1 ? currentStreak + 1 : 1;
            }
            else {
                currentStreak = 1;
            }
            lastDate = logDate;
            maxStreak = Math.max(maxStreak, currentStreak); // Atualiza maior streak
        }
        return reply.send({ maxStreak, currentStreak });
    }
    catch (err) {
        req.server.log.error(err);
        return reply.code(500).send({ error: "Erro ao buscar streaks" });
    }
};
exports.getStreakStats = getStreakStats;
