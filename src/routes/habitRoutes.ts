import { FastifyInstance } from "fastify";
import { getHabits, createHabit, deleteHabit, toggleHabitLog } from "../controllers/habitController";

export default async function habitRoutes(server: FastifyInstance) {
  server.get("/", { preHandler: [server.authGuard] }, getHabits);
  server.post("/", { preHandler: [server.authGuard] }, createHabit);
  server.delete("/:id", { preHandler: [server.authGuard] }, deleteHabit);
  server.post("/:id/logs/toggle", { preHandler: [server.authGuard] }, toggleHabitLog);
}
