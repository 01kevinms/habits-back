import Fastify from "fastify";
import cors from "@fastify/cors";
import authPlugin from "./plugins/auth";
import prismaPlugin from "./plugins/prisma";
import authRoutes from "./routes/auth.route";
import habitRoutes from "./routes/habit.route";
import statRoutes from "./routes/stat.route";
import DietRoutes from "./routes/diet.route";
import StatusRoutes from "./routes/status.routes";
import nutritionixRoutes from "./routes/nutrintion.routes";

// Define a porta do servidor (usa a variável de ambiente PORT, se existir, senão 3001)
const PORT = Number(process.env.PORT) || 3001;

// Cria a instância do servidor Fastify com logs habilitados
const server = Fastify({ logger: true });

// -------------------- Registrar Plugins --------------------

// Plugin para conectar ao banco de dados via Prisma
server.register(prismaPlugin);

// Plugin para autenticação com JWT
server.register(authPlugin);
// -------------------- Registrar CORS --------------------
// Define quais origens, métodos e headers podem acessar o backend
// https://01kevinms.github.io
server.register(cors, {
  origin: ["https://01kevinms.github.io"], // Origem permitida (seu frontend no GitHub Pages)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos liberados
  allowedHeaders: ["Content-Type", "Authorization"],    // Headers liberados
});

// -------------------- Registrar Rotas --------------------

// Rotas de autenticação (ex: /auth/login, /auth/register)
server.register(authRoutes, { prefix: "/auth" });
server.register(habitRoutes, { prefix: "/api/habit" });
server.register(statRoutes, { prefix: "/api/stat" });
server.register(DietRoutes, {prefix: "/api/diet"})
server.register(StatusRoutes, {prefix: "/api/status" })
server.register(nutritionixRoutes, { prefix: "/api/food" });
// -------------------- Inicialização --------------------

// Função que inicia o servidor
const start = async () => {
  try {
    // Inicia o servidor na porta configurada e acessível em qualquer rede
    await server.listen({ port: PORT, host: "0.0.0.0" });
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  } catch (err) {
    // Caso dê erro na inicialização, registra o erro e encerra o processo
    server.log.error(err);
    process.exit(1);
  }
};
// Chama a função para rodar o servidor
start();