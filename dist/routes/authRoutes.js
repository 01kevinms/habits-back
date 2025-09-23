"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const authController_1 = require("../controllers/authController");
async function authRoutes(server) {
    server.post("/register", authController_1.registerUser);
    server.post("/login", authController_1.loginUser);
}
