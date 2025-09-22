import { FastifyReply, FastifyRequest } from "fastify";
import bcrypt from "bcrypt";

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export const registerUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, password, name } = req.body as RegisterRequest;

  if (!email || !password || !name) {
    return reply.code(400).send({ error: "Nome, email e senha são obrigatórios" });
  }

  const existing = await req.server.prisma.user.findUnique({ where: { email } });
  if (existing) {
    return reply.code(400).send({ error: "Email já registrado" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await req.server.prisma.user.create({
    data: { email, name, passwordHash },
  });

  const token = req.server.jwt.sign({ id: user.id, email: user.email }, { expiresIn: "1d" });

  return { token, user: { id: user.id, name: user.name, email: user.email } };
};

export const loginUser = async (req: FastifyRequest, reply: FastifyReply) => {
  const { email, password } = req.body as LoginRequest;

  if (!email || !password) {
    return reply.code(400).send({ error: "Email e senha são obrigatórios" });
  }

  const user = await req.server.prisma.user.findUnique({ where: { email } });

  if (!user || !(user as any).passwordHash) {
    return reply.code(401).send({ error: "Usuário ou senha inválidos" });
  }

  const valid = await bcrypt.compare(password, (user as any).passwordHash);
  if (!valid) {
    return reply.code(401).send({ error: "Usuário ou senha inválidos" });
  }

  const token = req.server.jwt.sign({ id: user.id, email: user.email }, { expiresIn: "1d" });

  return reply.code(200).send({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
};
