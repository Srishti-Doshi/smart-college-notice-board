import { createHmac, timingSafeEqual } from "node:crypto";
import { type UserRole } from "../types/auth";

type AuthTokenPayload = {
  userId: string;
  role: UserRole;
  expiresAt: number;
};

const AUTH_COOKIE_NAME = "smart_notice_auth";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const TOKEN_TTL_MS = 7 * ONE_DAY_MS;

const getTokenSecret = () => process.env.AUTH_TOKEN_SECRET || "replace-this-in-env";

const base64UrlEncode = (value: string) =>
  Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

const base64UrlDecode = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
};

const sign = (value: string) =>
  createHmac("sha256", getTokenSecret()).update(value).digest("base64url");

export const createAuthToken = (userId: string, role: UserRole) => {
  const payload: AuthTokenPayload = {
    userId,
    role,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
};

export const verifyAuthToken = (token: string) => {
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

  if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(base64UrlDecode(encodedPayload)) as AuthTokenPayload;

    if (!decodedPayload.expiresAt || decodedPayload.expiresAt < Date.now()) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
};

export const getAuthCookieName = () => AUTH_COOKIE_NAME;

const isProduction = () => process.env.NODE_ENV === "production";

export const getAuthCookieOptions = () => ({
  httpOnly: true,
  // Cross-origin deployed clients need SameSite=None, while local HTTP dev
  // still needs a non-secure cookie that browsers will accept.
  sameSite: (isProduction() ? "none" : "lax") as "none" | "lax",
  secure: isProduction(),
  maxAge: TOKEN_TTL_MS,
});

export const getAuthClearCookieOptions = () => ({
  httpOnly: true,
  sameSite: (isProduction() ? "none" : "lax") as "none" | "lax",
  secure: isProduction(),
});
