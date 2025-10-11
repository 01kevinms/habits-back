"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StatusRoutes;
const status_controller_1 = require("../controllers/status.controller");
function StatusRoutes(server) {
    server.addHook("preHandler", server.authGuard);
    server.get("/", async (req, reply) => (0, status_controller_1.getStatus)(req, reply));
    server.post("/", async (req, reply) => (0, status_controller_1.createStatus)(req, reply));
    server.delete("/:id", async (req, reply) => (0, status_controller_1.deleteStatus)(req, reply));
}
