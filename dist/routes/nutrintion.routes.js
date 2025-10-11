"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = nutritionixRoutes;
const nutrition_Controller_1 = require("../controllers/nutrition.Controller");
async function nutritionixRoutes(server) {
    server.post("/nutritionix/search", nutrition_Controller_1.searchFood);
    server.post("/nutritionix/:id/foods", nutrition_Controller_1.searchFood);
}
