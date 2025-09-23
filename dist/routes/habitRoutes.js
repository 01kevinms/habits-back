"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = habitRoutes;
const habitController_1 = require("../controllers/habitController");
async function habitRoutes(server) {
    server.get("/", { preHandler: [server.authGuard] }, habitController_1.getHabits);
    server.post("/", { preHandler: [server.authGuard] }, habitController_1.createHabit);
    server.delete("/:id", { preHandler: [server.authGuard] }, habitController_1.deleteHabit);
    server.post("/:id/logs/toggle", { preHandler: [server.authGuard] }, habitController_1.toggleHabitLog);
}
