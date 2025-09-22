import fp from "fastify-plugin";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default fp(async (server) => {
  server.decorate("prisma", prisma);

  server.addHook("onClose", async (s) => {
    await s.prisma.$disconnect();
  });
});

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
