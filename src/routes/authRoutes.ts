import { FastifyInstance } from "fastify";
import { registerUser, loginUser } from "../controllers/authController";

export default async function authRoutes(server: FastifyInstance) {
  server.post("/register", registerUser);
  server.post("/login", loginUser);
}
