"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Importa o fastify-plugin, que permite criar plugins reutilizáveis para o servidor
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const client_1 = require("@prisma/client");
// Cria uma instância do PrismaClient, usada para acessar o banco de dados
const prisma = new client_1.PrismaClient();
// Exporta o plugin para registrar o Prisma no servidor Fastify
exports.default = (0, fastify_plugin_1.default)(async (server) => {
    // Adiciona (decorate) a instância do Prisma ao servidor Fastify,
    // permitindo acessar via "server.prisma" em qualquer rota/controller
    server.decorate("prisma", prisma);
    // Hook para fechar a conexão com o banco de dados quando o servidor for encerrado
    server.addHook("onClose", async (s) => {
        await s.prisma.$disconnect();
    });
});
