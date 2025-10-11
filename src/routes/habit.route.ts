import { FastifyInstance } from "fastify";

// Importa os controllers responsáveis por manipular hábitos
import {
  getHabits,
  createHabit,
  deleteHabit,
  toggleHabitLog,
} from "../controllers/habit.Controller";

// Define as rotas de hábitos
export default async function habitRoutes(server: FastifyInstance) {
  // Middleware global de autenticação para todas as rotas desta seção
  server.addHook("preHandler", server.authGuard);

  // Rota para listar hábitos do usuário logado (GET /api/habit/)
  server.get("/", async (req, reply) => getHabits(req, reply));

  // Rota para criar um novo hábito (POST /api/habit/)
  server.post("/", async (req, reply) => createHabit(req, reply));

  // Rota para deletar um hábito pelo ID (DELETE /api/habit/:id)
  server.delete("/:id", async (req, reply) => deleteHabit(req, reply));

  // Rota para alternar log de conclusão de um hábito em um dia (POST /api/habit/:id/logs/toggle)
  server.post("/:id/logs/toggle", async (req, reply) => toggleHabitLog(req, reply));
}
