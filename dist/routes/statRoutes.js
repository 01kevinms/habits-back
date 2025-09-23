"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = statRoutes;
const statController_1 = require("../controllers/statController");
async function statRoutes(server) {
    server.get("/weekly", { preHandler: [server.authGuard] }, statController_1.getWeeklyStats);
    server.get("/monthly", { preHandler: [server.authGuard] }, statController_1.getMonthlyStats);
    server.get("/streak", { preHandler: [server.authGuard] }, statController_1.getStreakStats);
}
