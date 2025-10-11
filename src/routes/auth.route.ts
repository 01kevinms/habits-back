import { FastifyInstance } from "fastify";

// Importa os controllers responsáveis pelo registro e login
import { registerUser, loginUser } from "../controllers/auth.controller";

// Define as rotas de autenticação
export default async function authRoutes(server: FastifyInstance) {
  // Rota para registro de usuário (POST /auth/register)
  server.post("/register", registerUser);

  // Rota para login de usuário (POST /auth/login)
  server.post("/login", loginUser);
}
