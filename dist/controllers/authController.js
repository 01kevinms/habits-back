"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const registerUser = async (req, reply) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return reply.code(400).send({ error: "Nome, email e senha são obrigatórios" });
    }
    const existing = await req.server.prisma.user.findUnique({ where: { email } });
    if (existing) {
        return reply.code(400).send({ error: "Email já registrado" });
    }
    const passwordHash = await bcrypt_1.default.hash(password, 10);
    const user = await req.server.prisma.user.create({
        data: { email, name, passwordHash },
    });
    const token = req.server.jwt.sign({ id: user.id, email: user.email }, { expiresIn: "1d" });
    return { token, user: { id: user.id, name: user.name, email: user.email } };
};
exports.registerUser = registerUser;
const loginUser = async (req, reply) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return reply.code(400).send({ error: "Email e senha são obrigatórios" });
    }
    const user = await req.server.prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
        return reply.code(401).send({ error: "Usuário ou senha inválidos" });
    }
    const valid = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!valid) {
        return reply.code(401).send({ error: "Usuário ou senha inválidos" });
    }
    const token = req.server.jwt.sign({ id: user.id, email: user.email }, { expiresIn: "1d" });
    return reply.code(200).send({
        token,
        user: { id: user.id, name: user.name, email: user.email },
    });
};
exports.loginUser = loginUser;
