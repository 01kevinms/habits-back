"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
// Importa os controllers responsáveis pelo registro e login
const auth_controller_1 = require("../controllers/auth.controller");
// Define as rotas de autenticação
async function authRoutes(server) {
    // Rota para registro de usuário (POST /auth/register)
    server.post("/register", auth_controller_1.registerUser);
    // Rota para login de usuário (POST /auth/login)
    server.post("/login", auth_controller_1.loginUser);
}
