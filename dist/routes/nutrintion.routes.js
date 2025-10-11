"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = nutritionixRoutes;
const nutrition_controller_1 = require("../controllers/nutrition.controller");
async function nutritionixRoutes(server) {
    server.post("/nutritionix/search", nutrition_controller_1.searchFood);
    server.post("/nutritionix/:id/foods", nutrition_controller_1.searchFood);
}
