"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
// Biblioteca para criptografar e verificar senhas
const bcrypt_1 = __importDefault(require("bcrypt"));
const registerUser = async (req, reply) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return reply.code(400).send({ error: "Nome, email e senha são obrigatórios" });
    }
    // Verifica se já existe um usuário com o mesmo email
    const existing = await req.server.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return reply.code(400).send({ error: "Email já registrado" });
    }
    // Criptografa a senha antes de salvar
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    // Cria novo usuário no banco com senha criptografada
    const user = await req.server.prisma.user.create({
        data: { email, name, passwordHash },
    });
    // Gera token JWT válido por n dia
    const token = req.server.jwt.sign({ id: user.id, email: user.email }, { expiresIn: "100d" });
    // Retorna token e informações básicas do usuário
    return {
        token,
        user: { id: user.id, name: user.name, email: user.email },
    };
};
exports.registerUser = registerUser;
// -------------------- LOGIN DE USUÁRIO --------------------
const loginUser = async (req, reply) => {
    // Extrai email e senha do corpo da requisição
    const { email, password } = req.body;
    // Validação: verifica se os dois campos foram enviados
    if (!email || !password) {
        return reply.code(400).send({ error: "Email e senha são obrigatórios" });
    }
    // Busca usuário pelo email
    const user = await req.server.prisma.user.findUnique({ where: { email } });
    // Se não existir usuário ou não houver senha registrada, retorna erro
    if (!user || !user.passwordHash) {
        return reply.code(401).send({ error: "Usuário ou senha inválidos" });
    }
    // Compara a senha informada com o hash armazenado no banco
    const valid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!valid) {
        return reply.code(401).send({ error: "Usuário ou senha inválidos" });
    }
    // Gera token JWT válido por 111 dia
    const token = req.server.jwt.sign({ id: user.id, email: user.email }, { expiresIn: "100d" });
    // Retorna token e dados do usuário
    return reply.code(200).send({
        token,
        user: { id: user.id, name: user.name, email: user.email },
    });
};
exports.loginUser = loginUser;
