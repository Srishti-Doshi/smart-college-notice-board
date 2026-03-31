import { type Request, type Response } from "express";
import { User } from "../models/User";
import {
  createAuthToken,
  getAuthClearCookieOptions,
  getAuthCookieName,
  getAuthCookieOptions,
} from "../services/authToken";
import { verifyPassword } from "../services/passwordHash";
import { type AuthenticatedRequest } from "../middleware/auth";
import { type UserRole } from "../types/auth";

type LoginRequest = Request<
  unknown,
  unknown,
  {
    email?: string;
    password?: string;
  }
>;

const toSafeUser = (user: {
  _id: { toString(): string };
  name: string;
  email: string;
  role: UserRole;
}) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
});

export const login = async (req: LoginRequest, res: Response) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password ?? "";

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const passwordMatches = await verifyPassword(password, user.passwordHash);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = createAuthToken(user._id.toString(), user.role as UserRole);
    res.cookie(getAuthCookieName(), token, getAuthCookieOptions());

    return res.json({ user: toSafeUser(user), token });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to login.",
    });
  }
};

export const logout = (_req: Request, res: Response) => {
  res.clearCookie(getAuthCookieName(), getAuthClearCookieOptions());
  return res.status(204).send();
};

export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.authUser) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    const user = await User.findById(req.authUser.userId);

    if (!user) {
      return res.status(401).json({ error: "Not authenticated." });
    }

    return res.json({ user: toSafeUser(user) });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to fetch session user.",
    });
  }
};
