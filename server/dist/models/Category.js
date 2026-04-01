"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    createdBy: {
        type: String,
        trim: true,
        default: "Admin",
    },
}, {
    timestamps: true,
});
categorySchema.index({ name: 1 }, { unique: true });
exports.Category = (0, mongoose_1.model)("Category", categorySchema);
