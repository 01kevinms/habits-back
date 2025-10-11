"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = statRoutes;
// Importa os controllers responsáveis pelas estatísticas
const stat_Controller_1 = require("../controllers/stat.Controller");
// Define as rotas de estatísticas
async function statRoutes(server) {
    // Middleware global de autenticação
    server.addHook("preHandler", server.authGuard);
    // Estatísticas diárias (GET /api/stat/daily)
    server.get("/daily", async (req, reply) => (0, stat_Controller_1.getDailyStats)(req, reply));
    // Estatísticas semanais (GET /api/stat/weekly)
    server.get("/weekly", async (req, reply) => (0, stat_Controller_1.getWeeklyStats)(req, reply));
    // Estatísticas mensais (GET /api/stat/monthly)
    server.get("/monthly", async (req, reply) => (0, stat_Controller_1.getMonthlyStats)(req, reply));
    // Estatísticas de streak (quantos dias seguidos mantendo hábitos) (GET /api/stat/streak)
    server.get("/streak", async (req, reply) => (0, stat_Controller_1.getStreakStats)(req, reply));
}
