import { FastifyInstance } from "fastify";
import { getWeeklyStats, getMonthlyStats, getStreakStats, getDailyStats } from "../controllers/statController";

export default async function statRoutes(server: FastifyInstance) {
  server.get("/daily", { preHandler: [server.authGuard] }, getDailyStats);
  server.get("/weekly", { preHandler: [server.authGuard] }, getWeeklyStats);
  server.get("/monthly", { preHandler: [server.authGuard] }, getMonthlyStats);
  server.get("/streak", { preHandler: [server.authGuard] }, getStreakStats);
}
