"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const auth_1 = __importDefault(require("./plugins/auth"));
const prisma_1 = __importDefault(require("./plugins/prisma"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const habitRoutes_1 = __importDefault(require("./routes/habitRoutes"));
const statRoutes_1 = __importDefault(require("./routes/statRoutes"));
const PORT = Number(process.env.PORT) || 3001;
const server = (0, fastify_1.default)({ logger: true });
// Registrar plugins
server.register(prisma_1.default);
server.register(auth_1.default);
// Registrar CORS
server.register(cors_1.default, {
    origin: ["https://01kevinms.github.io"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
});
// Registrar rotas
server.register(authRoutes_1.default, { prefix: "/auth" });
server.register(habitRoutes_1.default, { prefix: "/api/habit" });
server.register(statRoutes_1.default, { prefix: "/api/stat" });
const start = async () => {
    try {
        await server.listen({ port: PORT, host: "0.0.0.0" });
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
