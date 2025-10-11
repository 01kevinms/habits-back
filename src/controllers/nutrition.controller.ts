 import { FastifyRequest, FastifyReply } from "fastify"; 
 import fetch from "node-fetch";
 import { NutritionixFood } from "../types/fastify"; 


 const APP_ID = process.env.NUTRITIONIX_APP_ID!; 
 const API_KEY = process.env.NUTRITIONIX_API_KEY!; 

 interface NutritionixResponse { foods: NutritionixFood[]; } 

 export async function searchFood(req: FastifyRequest, reply: FastifyReply) { 

    try { 

    const { query } = req.body as { query: string }; 
    if (!query) { 
    return reply.status(400).send({ error: "O campo 'query' é obrigatório." }); }

 const res = await fetch("https://trackapi.nutritionix.com/v2/natural/nutrients", { 
    method: "POST", 
    headers: { "Content-Type": "application/json",
        "x-app-id": APP_ID, 
        "x-app-key": API_KEY, }, 
        body: JSON.stringify({ query }), });

         if (!res.ok) { 
    const text = await res.text(); 
    return reply.status(res.status).send({ error: "Erro da API Nutritionix", details: text }); } 

    const json = await res.json() as NutritionixResponse; 
    
 return reply.send(json.foods); } 
 catch (error) { 
    console.error("Erro ao buscar alimento:", error); 
    return reply.status(500).send({ error: "Erro interno ao buscar alimento" }); } }


