import fp from "fastify-plugin";
import fastifyJwt from "@fastify/jwt";
// Declaração de tipos adicionais para Fastify
declare module "fastify" {
  interface FastifyInstance {
    // authGuard será uma função que verifica JWT
    authGuard: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

// Declaração de tipos adicionais para Fastify JWT
import "@fastify/jwt";
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string; email: string }; // Payload do token
    user: { id: string; email: string };    // Usuário autenticado
  }
}

// Exporta plugin do Fastify
export default fp(async (server) => {
  // Se JWT_SECRET não estiver definido, avisa no log (apenas para dev)
  if (!process.env.JWT_SECRET) {
    server.log.warn("⚠️ JWT_SECRET não definido! Usando chave insegura para dev.");
  }

  // Registra plugin JWT com secret
  server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || "dev-secret",
  });

  // Decora o servidor com a função authGuard
  server.decorate("authGuard", async (req, reply) => {
    try {
      // Verifica o token JWT enviado na requisição
      await req.jwtVerify();
    } catch (error) {
      server.log.error("Falha na verificação JWT:");
      return reply.code(401).send({ error: "Não autorizado" });
    }
  });
});
