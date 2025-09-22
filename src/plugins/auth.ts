import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
import { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authGuard: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; email: string };
    user: { id: string; email: string };
  }
}

export default fp(async (server) => {
  if (!process.env.JWT_SECRET) {
    server.log.warn("⚠️ JWT_SECRET não definido! Usando chave insegura para dev.");
  }

  server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "dev-secret",
  });

  server.decorate("authGuard", async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch (error) {
      server.log.error("Falha na verificação JWT:");
      return reply.code(401).send({ error: "Não autorizado" });
    }
  });
});
