"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.logout = exports.login = void 0;
const User_1 = require("../models/User");
const authToken_1 = require("../services/authToken");
const passwordHash_1 = require("../services/passwordHash");
const toSafeUser = (user) => ({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
});
const login = async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password ?? "";
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required." });
        }
        const user = await User_1.User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        const passwordMatches = await (0, passwordHash_1.verifyPassword)(password, user.passwordHash);
        if (!passwordMatches) {
            return res.status(401).json({ error: "Invalid credentials." });
        }
        const token = (0, authToken_1.createAuthToken)(user._id.toString(), user.role);
        res.cookie((0, authToken_1.getAuthCookieName)(), token, (0, authToken_1.getAuthCookieOptions)());
        return res.json({ user: toSafeUser(user) });
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to login.",
        });
    }
};
exports.login = login;
const logout = (_req, res) => {
    res.clearCookie((0, authToken_1.getAuthCookieName)(), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });
    return res.status(204).send();
};
exports.logout = logout;
const getCurrentUser = async (req, res) => {
    try {
        if (!req.authUser) {
            return res.status(401).json({ error: "Not authenticated." });
        }
        const user = await User_1.User.findById(req.authUser.userId);
        if (!user) {
            return res.status(401).json({ error: "Not authenticated." });
        }
        return res.json({ user: toSafeUser(user) });
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch session user.",
        });
    }
};
exports.getCurrentUser = getCurrentUser;
