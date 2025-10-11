// Importa o fastify-plugin, que permite criar plugins reutilizáveis para o servidor
import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

// Cria uma instância do PrismaClient, usada para acessar o banco de dados
const prisma = new PrismaClient();

// Exporta o plugin para registrar o Prisma no servidor Fastify
export default fp(async (server) => {
  // Adiciona (decorate) a instância do Prisma ao servidor Fastify,
  // permitindo acessar via "server.prisma" em qualquer rota/controller
  server.decorate("prisma", prisma);

  // Hook para fechar a conexão com o banco de dados quando o servidor for encerrado
  server.addHook("onClose", async (s) => {
    await s.prisma.$disconnect();
  });
});

// Declaração de tipos para o Fastify
declare module "fastify" {
  // Expande a interface FastifyInstance para incluir "prisma"
  interface FastifyInstance {
    prisma: PrismaClient; // Agora o servidor reconhece "server.prisma" com tipagem correta
  }
}
