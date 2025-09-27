"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = habitRoutes;
const habitController_1 = require("../controllers/habitController");
async function habitRoutes(server) {
    // middleware global
    server.addHook("preHandler", server.authGuard);
    server.get("/", async (req, reply) => (0, habitController_1.getHabits)(req, reply));
    server.post("/", async (req, reply) => (0, habitController_1.createHabit)(req, reply));
    server.delete("/:id", async (req, reply) => (0, habitController_1.deleteHabit)(req, reply));
    server.post("/:id/logs/toggle", async (req, reply) => (0, habitController_1.toggleHabitLog)(req, reply));
}
