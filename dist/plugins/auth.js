"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
// Declaração de tipos adicionais para Fastify JWT
require("@fastify/jwt");
// Exporta plugin do Fastify
exports.default = (0, fastify_plugin_1.default)(async (server) => {
    // Se JWT_SECRET não estiver definido, avisa no log (apenas para dev)
    if (!process.env.JWT_SECRET) {
        server.log.warn("⚠️ JWT_SECRET não definido! Usando chave insegura para dev.");
    }
    // Registra plugin JWT com secret
    server.register(jwt_1.default, {
        secret: process.env.JWT_SECRET || "dev-secret",
    });
    // Decora o servidor com a função authGuard
    server.decorate("authGuard", async (req, reply) => {
        try {
            // Verifica o token JWT enviado na requisição
            await req.jwtVerify();
        }
        catch (error) {
            server.log.error("Falha na verificação JWT:");
            return reply.code(401).send({ error: "Não autorizado" });
        }
    });
});
