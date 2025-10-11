import { FastifyInstance } from "fastify";
import { createStatus, deleteStatus, getStatus } from "../controllers/status.Controller";
import { NewStatusPhysical } from "../types/fastify";

export default function StatusRoutes(server:FastifyInstance ){
server.addHook("preHandler", server.authGuard)

server.get("/", async (req, reply)=> getStatus(req, reply))
server.post<{ Body: NewStatusPhysical }>("/", async (req, reply)=> createStatus(req, reply))
server.delete<{ Params: { id: string } }>("/:id", async (req, reply)=> deleteStatus(req, reply))
}