"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = StatusRoutes;
const status_Controller_1 = require("../controllers/status.Controller");
function StatusRoutes(server) {
    server.addHook("preHandler", server.authGuard);
    server.get("/", async (req, reply) => (0, status_Controller_1.getStatus)(req, reply));
    server.post("/", async (req, reply) => (0, status_Controller_1.createStatus)(req, reply));
    server.delete("/:id", async (req, reply) => (0, status_Controller_1.deleteStatus)(req, reply));
}
