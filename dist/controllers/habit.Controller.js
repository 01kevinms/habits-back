"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleHabitLog = exports.deleteHabit = exports.createHabit = exports.getHabits = void 0;
// Função auxiliar que retorna a data de hoje no formato YYYY-MM-DD
function getTodayKey() {
    return new Date().toISOString().split("T")[0];
}
/**
 * GET /habits
 * Lista todos os hábitos do usuário com seus logs e status do dia atual
 */
const getHabits = async (req, reply) => {
    try {
        const userId = req.user.id; // ID do usuário autenticado
        const todayKey = getTodayKey(); // Data de hoje
        // Busca todos os hábitos do usuário, incluindo logs
        const habits = await req.server.prisma.habit.findMany({
            where: { userId },
            include: { logs: true },
            orderBy: { createdAt: "desc" }, // Ordena do mais recente para o mais antigo
        });
        // Mapeia hábitos adicionando todayStatus (se o hábito foi concluído hoje)
        const res = habits.map((h) => {
            const todayStatus = h.logs.some((l) => l.dayKey === todayKey && l.status);
            return {
                id: h.id,
                title: h.title,
                description: h.description,
                frequency: h.frequency,
                userId: h.userId,
                createdAt: h.createdAt,
                logs: h.logs ?? [], // Garante sempre um array
                todayStatus, // Booleano indicando status do dia
            };
        });
        return reply.send(res);
    }
    catch (err) {
        req.server.log.error(err);
        return reply.code(500).send({ error: "Erro ao buscar hábitos" });
    }
};
exports.getHabits = getHabits;
/**
 * POST /habits
 * Cria um novo hábito para o usuário
 */
const createHabit = async (req, reply) => {
    try {
        const userId = req.user.id; // ID do usuário
        const { title, description, frequency } = req.body;
        // Cria o hábito no banco
        const created = await req.server.prisma.habit.create({
            data: { title, description, frequency, userId },
        });
        // Retorna os dados do hábito recém-criado
        return reply.code(201).send({
            id: created.id,
            title: created.title,
            description: created.description,
            frequency: created.frequency,
            userId: created.userId,
            createdAt: created.createdAt,
            logs: [], // Sempre inicia com array vazio
            todayStatus: false, // Inicialmente não concluído hoje
        });
    }
    catch (err) {
        req.server.log.error(err);
        return reply.code(500).send({ error: "Erro ao criar hábito" });
    }
};
exports.createHabit = createHabit;
/**
 * DELETE /habits/:id
 * Remove um hábito e todos os seus logs
 */
const deleteHabit = async (req, reply) => {
    try {
        const { id } = req.params;
        // Remove todos os logs do hábito
        await req.server.prisma.habitLog.deleteMany({ where: { habitId: id } });
        // Remove o hábito em si
        await req.server.prisma.habit.delete({ where: { id } });
        return reply.send({ success: true });
    }
    catch (err) {
        req.server.log.error(err);
        return reply.code(500).send({ error: "Erro ao deletar hábito" });
    }
};
exports.deleteHabit = deleteHabit;
/**
 * PATCH /habits/:id/toggle
 * Marca ou desmarca o hábito como concluído no dia atual
 */
const toggleHabitLog = async (req, reply) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const todayKey = getTodayKey();
        // Verifica se já existe um log do hábito para hoje
        const existing = await req.server.prisma.habitLog.findUnique({
            where: { habitId_dayKey: { habitId: id, dayKey: todayKey } },
        });
        if (existing) {
            // Se já existe, remove (desmarca)
            await req.server.prisma.habitLog.delete({ where: { id: existing.id } });
        }
        else {
            // Caso contrário, cria log marcado como concluído
            await req.server.prisma.habitLog.create({
                data: { habitId: id, dayKey: todayKey, status: true },
            });
        }
        // Busca o hábito atualizado incluindo logs
        const habit = await req.server.prisma.habit.findUnique({
            where: { id },
            include: { logs: true },
        });
        if (!habit) {
            return reply.code(404).send({ error: "Hábito não encontrado" });
        }
        // Verifica se o hábito foi concluído hoje
        const todayStatus = habit.logs.some((l) => l.dayKey === todayKey && l.status);
        // Busca todos os hábitos do usuário para estatísticas
        const allHabits = await req.server.prisma.habit.findMany({
            where: { userId },
            include: { logs: true },
        });
        const totalHabits = allHabits.length;
        const completedToday = allHabits.filter((h) => h.logs.some((l) => l.dayKey === todayKey && l.status)).length;
        const percent = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        // Retorna dados atualizados do hábito e estatísticas
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
    }
    catch (err) {
        req.server.log.error(err);
        return reply.code(500).send({ error: "Erro ao alternar log do hábito" });
    }
};
exports.toggleHabitLog = toggleHabitLog;
