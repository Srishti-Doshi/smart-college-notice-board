"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const auth_1 = require("./middleware/auth");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const noticeRoutes_1 = __importDefault(require("./routes/noticeRoutes"));
const app = (0, express_1.default)();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";
app.use((0, cors_1.default)({
    origin: clientOrigin,
    credentials: true,
}));
app.use(express_1.default.json());
app.use(auth_1.attachAuthUser);
app.get("/", (_req, res) => {
    res.send("College Notice Board Server is running.");
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/notices", noticeRoutes_1.default);
exports.default = app;
