"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const auth_1 = require("../types/auth");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: auth_1.USER_ROLES,
        required: true,
        default: "student",
    },
}, {
    timestamps: true,
});
userSchema.index({ email: 1 }, { unique: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
