"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DietRoutes;
const diet_Controller_1 = require("../controllers/diet.Controller");
async function DietRoutes(server) {
    server.addHook("preHandler", server.authGuard);
    server.get("/", async (req, reply) => (0, diet_Controller_1.getDiet)(req, reply));
    server.post("/", async (req, reply) => (0, diet_Controller_1.createDiet)(req, reply));
    server.post("/:dietId/food", async (req, reply) => (0, diet_Controller_1.createFood)(req, reply));
    server.put("/:id", async (req, reply) => (0, diet_Controller_1.updateDiet)(req, reply));
    server.put("/:dietId/food/:id", async (req, reply) => (0, diet_Controller_1.updateFood)(req, reply));
    server.delete("/:id", async (req, reply) => (0, diet_Controller_1.deletDiet)(req, reply));
    server.delete("/:dietId/food/:id", async (req, reply) => (0, diet_Controller_1.deleteFood)(req, reply));
}
