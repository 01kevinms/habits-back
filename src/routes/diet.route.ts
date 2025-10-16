// diet.routes.ts
import { FastifyInstance } from "fastify";
import { createDiet, getDiet, deletDiet, deleteFood, createFood, updateFood, updateDiet, getDietProgress } from "../controllers/diet.Controller";
import { NewDietBody } from "../types/fastify";

export default async function DietRoutes(server: FastifyInstance) {
server.addHook("preHandler", server.authGuard  )
  server.get("/", async (req, reply) => getDiet(req, reply));
  server.get("/progress", async (req, reply) => getDietProgress(req, reply));
  server.post("/progress", async (req, reply) => getDietProgress(req, reply));

  server.post<{ Body: NewDietBody }>("/", async (req, reply) => createDiet(req, reply));
  server.post<{ Params: { dietId: string } }>("/:dietId/food", async (req, reply) => createFood(req, reply));
  server.put("/:id", async (req, reply) => updateDiet(req, reply)); 
  server.put("/:dietId/food/:id", async (req, reply) => updateFood(req, reply));
  server.delete<{ Params: { id: string } }>("/:id", async (req, reply) => deletDiet(req, reply));
  server.delete("/:dietId/food/:id", async (req, reply) => deleteFood(req, reply));
}