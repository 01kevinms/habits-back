import { FastifyInstance } from "fastify";
import { createStatus, deleteStatus, getStatus, getWaterProgress, updateWater } from "../controllers/status.Controller";

export default function StatusRoutes(server:FastifyInstance ){
server.addHook("preHandler", server.authGuard)

server.get("/", async (req, reply)=> getStatus(req, reply))
server.get("/water", async (req, reply)=> getWaterProgress(req, reply))
server.post("/", async (req, reply)=> createStatus(req, reply))
server.put("/:id/water", async (req, reply)=> updateWater(req, reply))
server.delete<{ Params: { id: string } }>("/:id", async (req, reply)=> deleteStatus(req, reply))
}