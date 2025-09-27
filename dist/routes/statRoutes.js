"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = statRoutes;
const statController_1 = require("../controllers/statController");
async function statRoutes(server) {
    server.addHook("preHandler", server.authGuard);
    server.get("/daily", async (req, reply) => (0, statController_1.getDailyStats)(req, reply));
    server.get("/weekly", async (req, reply) => (0, statController_1.getWeeklyStats)(req, reply));
    server.get("/monthly", async (req, reply) => (0, statController_1.getMonthlyStats)(req, reply));
    server.get("/streak", async (req, reply) => (0, statController_1.getStreakStats)(req, reply));
}
