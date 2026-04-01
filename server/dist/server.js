"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const bootstrapCategories_1 = require("./services/bootstrapCategories");
const bootstrapUsers_1 = require("./services/bootstrapUsers");
const PORT = Number(process.env.PORT) || 5000;
const startServer = async () => {
    try {
        await (0, db_1.connectDatabase)();
        await (0, bootstrapCategories_1.ensureDefaultCategories)();
        await (0, bootstrapUsers_1.ensureDefaultUsers)();
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
};
void startServer();
