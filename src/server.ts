import Fastify from "fastify";
import cors from "@fastify/cors";
import authPlugin from "./plugins/auth";
import prismaPlugin from "./plugins/prisma";

import authRoutes from "./routes/authRoutes";
import habitRoutes from "./routes/habitRoutes";
import statRoutes from "./routes/statRoutes";

const PORT = Number(process.env.PORT) || 3001;
const server = Fastify({ logger: true });

// Registrar plugins
server.register(prismaPlugin);
server.register(authPlugin);

// Registrar CORS
// "https://01kevinms.github.io"
server.register(cors, {
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Registrar rotas
server.register(authRoutes, { prefix: "/auth" });
server.register(habitRoutes, { prefix: "/api/habit" });
server.register(statRoutes, { prefix: "/api/stat" });


const start = async () => {
  try {
    await server.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
