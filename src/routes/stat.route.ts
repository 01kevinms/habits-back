import { FastifyInstance } from "fastify";

// Importa os controllers responsáveis pelas estatísticas
import {
  getDailyStats,
  getWeeklyStats,
  getMonthlyStats,
  getStreakStats,
} from "../controllers/stat.controller";

// Define as rotas de estatísticas
export default async function statRoutes(server: FastifyInstance) {
  // Middleware global de autenticação
  server.addHook("preHandler", server.authGuard);

  // Estatísticas diárias (GET /api/stat/daily)
  server.get("/daily", async (req, reply) => getDailyStats(req, reply));

  // Estatísticas semanais (GET /api/stat/weekly)
  server.get("/weekly", async (req, reply) => getWeeklyStats(req, reply));

  // Estatísticas mensais (GET /api/stat/monthly)
  server.get("/monthly", async (req, reply) => getMonthlyStats(req, reply));

  // Estatísticas de streak (quantos dias seguidos mantendo hábitos) (GET /api/stat/streak)
  server.get("/streak", async (req, reply) => getStreakStats(req, reply));
}
