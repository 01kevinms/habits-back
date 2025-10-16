"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const auth_1 = __importDefault(require("./plugins/auth"));
const prisma_1 = __importDefault(require("./plugins/prisma"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const habit_route_1 = __importDefault(require("./routes/habit.route"));
const stat_route_1 = __importDefault(require("./routes/stat.route"));
const diet_route_1 = __importDefault(require("./routes/diet.route"));
const status_routes_1 = __importDefault(require("./routes/status.routes"));
const nutrintion_routes_1 = __importDefault(require("./routes/nutrintion.routes"));
// Define a porta do servidor (usa a variável de ambiente PORT, se existir, senão 3001)
const PORT = Number(process.env.PORT) || 3001;
// Cria a instância do servidor Fastify com logs habilitados
const server = (0, fastify_1.default)({ logger: true });
// -------------------- Registrar Plugins --------------------
// Plugin para conectar ao banco de dados via Prisma
server.register(prisma_1.default);
// Plugin para autenticação com JWT
server.register(auth_1.default);
// -------------------- Registrar CORS --------------------
// Define quais origens, métodos e headers podem acessar o backend
// https://01kevinms.github.io
server.register(cors_1.default, {
    origin: ["https://01kevinms.github.io"], // Origem permitida (seu frontend no GitHub Pages)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos liberados
    allowedHeaders: ["Content-Type", "Authorization"], // Headers liberados
});
// -------------------- Registrar Rotas --------------------
// Rotas de autenticação (ex: /auth/login, /auth/register)
server.register(auth_route_1.default, { prefix: "/auth" });
server.register(habit_route_1.default, { prefix: "/api/habit" });
server.register(stat_route_1.default, { prefix: "/api/stat" });
server.register(diet_route_1.default, { prefix: "/api/diet" });
server.register(status_routes_1.default, { prefix: "/api/status" });
server.register(nutrintion_routes_1.default, { prefix: "/api/food" });
// -------------------- Inicialização --------------------
// Função que inicia o servidor
const start = async () => {
    try {
        // Inicia o servidor na porta configurada e acessível em qualquer rede
        await server.listen({ port: PORT, host: "0.0.0.0" });
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    }
    catch (err) {
        // Caso dê erro na inicialização, registra o erro e encerra o processo
        server.log.error(err);
        process.exit(1);
    }
};
// Chama a função para rodar o servidor
start();
