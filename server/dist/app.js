"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const node_path_1 = __importDefault(require("node:path"));
const auth_1 = require("./middleware/auth");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const noticeRoutes_1 = __importDefault(require("./routes/noticeRoutes"));
const app = (0, express_1.default)();
const allowedOrigins = (process.env.CORS_ORIGINS ||
    process.env.CLIENT_ORIGIN ||
    "http://localhost:3000,https://smart-college-notice-board-first.onrender.com")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }
        callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(auth_1.attachAuthUser);
app.get("/", (_req, res) => {
    res.send("College Notice Board Server is running.");
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/notices", noticeRoutes_1.default);
const clientBuildPath = node_path_1.default.resolve(__dirname, "../../client/build");
if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(clientBuildPath));
    app.get("/{*splat}", (req, res, next) => {
        if (req.path.startsWith("/api/")) {
            next();
            return;
        }
        res.sendFile(node_path_1.default.join(clientBuildPath, "index.html"));
    });
}
exports.default = app;
