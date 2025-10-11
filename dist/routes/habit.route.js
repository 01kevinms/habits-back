"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = habitRoutes;
// Importa os controllers responsáveis por manipular hábitos
const habit_Controller_1 = require("../controllers/habit.Controller");
// Define as rotas de hábitos
async function habitRoutes(server) {
    // Middleware global de autenticação para todas as rotas desta seção
    server.addHook("preHandler", server.authGuard);
    // Rota para listar hábitos do usuário logado (GET /api/habit/)
    server.get("/", async (req, reply) => (0, habit_Controller_1.getHabits)(req, reply));
    // Rota para criar um novo hábito (POST /api/habit/)
    server.post("/", async (req, reply) => (0, habit_Controller_1.createHabit)(req, reply));
    // Rota para deletar um hábito pelo ID (DELETE /api/habit/:id)
    server.delete("/:id", async (req, reply) => (0, habit_Controller_1.deleteHabit)(req, reply));
    // Rota para alternar log de conclusão de um hábito em um dia (POST /api/habit/:id/logs/toggle)
    server.post("/:id/logs/toggle", async (req, reply) => (0, habit_Controller_1.toggleHabitLog)(req, reply));
}
