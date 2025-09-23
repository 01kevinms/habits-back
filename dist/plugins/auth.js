"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
require("@fastify/jwt");
exports.default = (0, fastify_plugin_1.default)(async (server) => {
    if (!process.env.JWT_SECRET) {
        server.log.warn("⚠️ JWT_SECRET não definido! Usando chave insegura para dev.");
    }
    server.register(jwt_1.default, {
        secret: process.env.JWT_SECRET || "dev-secret",
    });
    server.decorate("authGuard", async (req, reply) => {
        try {
            await req.jwtVerify();
        }
        catch (error) {
            server.log.error("Falha na verificação JWT:");
            return reply.code(401).send({ error: "Não autorizado" });
        }
    });
});
