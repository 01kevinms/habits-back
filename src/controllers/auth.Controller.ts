import { FastifyReply, FastifyRequest } from "fastify";

// Biblioteca para criptografar e verificar senhas
import bcrypt from "bcrypt";
import { LoginRequest, RegisterRequest } from "../types/fastify";


export const registerUser = async (req: FastifyRequest, reply: FastifyReply) => {

  const { email, password, name } = req.body as RegisterRequest;


  if (!email || !password || !name) {
    return reply.code(400).send({ error: "Nome, email e senha são obrigatórios" });
  }

  // Verifica se já existe um usuário com o mesmo email
  const existing = await req.server.prisma.user.findUnique({ where: { email } });
  if (existing) {
    return reply.code(400).send({ error: "Email já registrado" });
  }

  // Criptografa a senha antes de salvar
  const passwordHash = await bcrypt.hash(password, 10);

  // Cria novo usuário no banco com senha criptografada
  const user = await req.server.prisma.user.create({
    data: { email, name, passwordHash },
  });

  // Gera token JWT válido por n dia
  const token = req.server.jwt.sign(
    { id: user.id, email: user.email },
    { expiresIn: "100d" }
  );

  // Retorna token e informações básicas do usuário
  return {
    token,
    user: { id: user.id, name: user.name, email: user.email },
  };
};

// -------------------- LOGIN DE USUÁRIO --------------------
export const loginUser = async (req: FastifyRequest, reply: FastifyReply) => {
  // Extrai email e senha do corpo da requisição
  const { email, password } = req.body as LoginRequest;

  // Validação: verifica se os dois campos foram enviados
  if (!email || !password) {
    return reply.code(400).send({ error: "Email e senha são obrigatórios" });
  }

  // Busca usuário pelo email
  const user = await req.server.prisma.user.findUnique({ where: { email } });

  // Se não existir usuário ou não houver senha registrada, retorna erro
  if (!user || !(user as any).passwordHash) {
    return reply.code(401).send({ error: "Usuário ou senha inválidos" });
  }

  // Compara a senha informada com o hash armazenado no banco
  const valid = await bcrypt.compare(password, (user as any).passwordHash);
  if (!valid) {
    return reply.code(401).send({ error: "Usuário ou senha inválidos" });
  }

  // Gera token JWT válido por 111 dia
  const token = req.server.jwt.sign(
    { id: user.id, email: user.email },
    { expiresIn: "100d" }
  );

  // Retorna token e dados do usuário
  return reply.code(200).send({
    token,
    user: { id: user.id, name: user.name, email: user.email },
  });
};
