import { type NextFunction, type Request, type Response } from "express";
import { type UserRole } from "../types/auth";
import { getAuthCookieName, verifyAuthToken } from "../services/authToken";

export type AuthenticatedRequest = Request & {
  authUser?: {
    userId: string;
    role: UserRole;
  };
};

const parseCookies = (cookieHeader?: string) => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, item) => {
    const [rawKey, ...rawValue] = item.trim().split("=");
    if (!rawKey) {
      return acc;
    }

    try {
      acc[rawKey] = decodeURIComponent(rawValue.join("=") || "");
    } catch {
      acc[rawKey] = rawValue.join("=") || "";
    }

    return acc;
  }, {});
};

const parseBearerToken = (authorizationHeader?: string) => {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.trim().split(/\s+/, 2);

  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return null;
  }

  return token;
};

export const attachAuthUser = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const cookieMap = parseCookies(req.headers.cookie);
  const authToken =
    cookieMap[getAuthCookieName()] || parseBearerToken(req.headers.authorization);

  if (!authToken) {
    return next();
  }

  const payload = verifyAuthToken(authToken);

  if (payload) {
    req.authUser = {
      userId: payload.userId,
      role: payload.role,
    };
  }

  return next();
};

export const requireAuth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.authUser) {
    return res.status(401).json({ error: "Authentication required." });
  }

  return next();
};

export const requireRole =
  (...allowedRoles: UserRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.authUser) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      return res.status(403).json({ error: "You are not allowed to perform this action." });
    }

    return next();
  };
