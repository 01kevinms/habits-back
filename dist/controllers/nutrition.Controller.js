"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchFood = searchFood;
const node_fetch_1 = __importDefault(require("node-fetch"));
// API CHAVE
const APP_ID = process.env.NUTRITIONIX_APP_ID;
const API_KEY = process.env.NUTRITIONIX_API_KEY;
async function searchFood(req, reply) {
    try {
        const { query } = req.body;
        if (!query) {
            return reply.status(400).send({ error: "O campo 'query' é obrigatório." });
        }
        const res = await (0, node_fetch_1.default)("https://trackapi.nutritionix.com/v2/natural/nutrients", {
            method: "POST",
            headers: { "Content-Type": "application/json",
                "x-app-id": APP_ID,
                "x-app-key": API_KEY, },
            body: JSON.stringify({ query }),
        });
        if (!res.ok) {
            const text = await res.text();
            return reply.status(res.status).send({ error: "Erro da API Nutritionix", details: text });
        }
        const json = await res.json();
        return reply.send(json.foods);
    }
    catch (error) {
        console.error("Erro ao buscar alimento:", error);
        return reply.status(500).send({ error: "Erro interno ao buscar alimento" });
    }
}
