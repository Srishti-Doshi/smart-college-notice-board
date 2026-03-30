"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.requireAuth = exports.attachAuthUser = void 0;
const authToken_1 = require("../services/authToken");
const parseCookies = (cookieHeader) => {
    if (!cookieHeader) {
        return {};
    }
    return cookieHeader.split(";").reduce((acc, item) => {
        const [rawKey, ...rawValue] = item.trim().split("=");
        if (!rawKey) {
            return acc;
        }
        try {
            acc[rawKey] = decodeURIComponent(rawValue.join("=") || "");
        }
        catch {
            acc[rawKey] = rawValue.join("=") || "";
        }
        return acc;
    }, {});
};
const attachAuthUser = (req, _res, next) => {
    const cookieMap = parseCookies(req.headers.cookie);
    const authToken = cookieMap[(0, authToken_1.getAuthCookieName)()];
    if (!authToken) {
        return next();
    }
    const payload = (0, authToken_1.verifyAuthToken)(authToken);
    if (payload) {
        req.authUser = {
            userId: payload.userId,
            role: payload.role,
        };
    }
    return next();
};
exports.attachAuthUser = attachAuthUser;
const requireAuth = (req, res, next) => {
    if (!req.authUser) {
        return res.status(401).json({ error: "Authentication required." });
    }
    return next();
};
exports.requireAuth = requireAuth;
const requireRole = (...allowedRoles) => (req, res, next) => {
    if (!req.authUser) {
        return res.status(401).json({ error: "Authentication required." });
    }
    if (!allowedRoles.includes(req.authUser.role)) {
        return res.status(403).json({ error: "You are not allowed to perform this action." });
    }
    return next();
};
exports.requireRole = requireRole;
