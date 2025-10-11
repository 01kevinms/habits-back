import { FastifyInstance } from "fastify";
import { searchFood } from "../controllers/nutrition.Controller";


export default async function nutritionixRoutes(server: FastifyInstance) {
     server.post("/nutritionix/search", searchFood); }