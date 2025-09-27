import { FastifyInstance } from "fastify";
import {
  getHabits,
  createHabit,
  deleteHabit,
  toggleHabitLog,
} from "../controllers/habitController";

export default async function habitRoutes(server: FastifyInstance) {
  // middleware global
  server.addHook("preHandler", server.authGuard);

  server.get("/", async (req, reply) => getHabits(req, reply));
  server.post("/", async (req, reply) => createHabit(req, reply));
  server.delete("/:id", async (req, reply) => deleteHabit(req, reply));
  server.post("/:id/logs/toggle", async (req, reply) => toggleHabitLog(req, reply));
}
