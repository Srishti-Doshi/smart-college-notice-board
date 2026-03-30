"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthCookieOptions = exports.getAuthCookieName = exports.verifyAuthToken = exports.createAuthToken = void 0;
const node_crypto_1 = require("node:crypto");
const AUTH_COOKIE_NAME = "smart_notice_auth";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TOKEN_TTL_MS = 7 * ONE_DAY_MS;
const getTokenSecret = () => process.env.AUTH_TOKEN_SECRET || "replace-this-in-env";
const base64UrlEncode = (value) => Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
const base64UrlDecode = (value) => {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};
const sign = (value) => (0, node_crypto_1.createHmac)("sha256", getTokenSecret()).update(value).digest("base64url");
const createAuthToken = (userId, role) => {
    const payload = {
        userId,
        role,
        expiresAt: Date.now() + TOKEN_TTL_MS,
    };
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signature = sign(encodedPayload);
    return `${encodedPayload}.${signature}`;
};
exports.createAuthToken = createAuthToken;
const verifyAuthToken = (token) => {
    const [encodedPayload, providedSignature] = token.split(".");
    if (!encodedPayload || !providedSignature) {
        return null;
    }
    const expectedSignature = sign(encodedPayload);
    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (providedBuffer.length !== expectedBuffer.length) {
        return null;
    }
    if (!(0, node_crypto_1.timingSafeEqual)(providedBuffer, expectedBuffer)) {
        return null;
    }
    try {
        const decodedPayload = JSON.parse(base64UrlDecode(encodedPayload));
        if (!decodedPayload.expiresAt || decodedPayload.expiresAt < Date.now()) {
            return null;
        }
        return decodedPayload;
    }
    catch {
        return null;
    }
};
exports.verifyAuthToken = verifyAuthToken;
const getAuthCookieName = () => AUTH_COOKIE_NAME;
exports.getAuthCookieName = getAuthCookieName;
const getAuthCookieOptions = () => ({
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_TTL_MS,
});
exports.getAuthCookieOptions = getAuthCookieOptions;
