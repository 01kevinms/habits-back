import { FastifyInstance } from "fastify";
import {
  getDailyStats,
  getWeeklyStats,
  getMonthlyStats,
  getStreakStats,
} from "../controllers/statController";

export default async function statRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authGuard);

  server.get("/daily", async (req, reply) => getDailyStats(req, reply));
  server.get("/weekly", async (req, reply) => getWeeklyStats(req, reply));
  server.get("/monthly", async (req, reply) => getMonthlyStats(req, reply));
  server.get("/streak", async (req, reply) => getStreakStats(req, reply));
}
