import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type UserType = "admin" | "client";

export interface TokenPayload {
  sub: string;
  type: UserType;
}

export function signAccessToken(payload: TokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.jwtAccessTtl as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtAccessSecret, options);
}

export function signRefreshToken(payload: TokenPayload): string {
  const options: jwt.SignOptions = { expiresIn: env.jwtRefreshTtl as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtRefreshSecret, options);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtAccessSecret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;
}
