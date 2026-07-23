import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

export function signAccess(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
}

export function signRefresh(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyAccess(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function verifyRefresh(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
