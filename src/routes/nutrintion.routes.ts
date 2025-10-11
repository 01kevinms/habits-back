import { FastifyInstance } from "fastify";
import { searchFood } from "../controllers/nutrition.controller";


export default async function nutritionixRoutes(server: FastifyInstance) {
    server.post("/nutritionix/search", searchFood); 
    server.post("/nutritionix/:id/foods", searchFood); 
}