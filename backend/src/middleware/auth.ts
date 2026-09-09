import { NextFunction, Request, Response } from "express";
import { TokenPayload, UserType, verifyAccessToken } from "../utils/jwt";
import { UnauthorizedError } from "../utils/errors";

declare global {
  namespace Express {
    interface Request {
      auth?: TokenPayload;
    }
  }
}

function extractToken(req: Request): string {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    throw new UnauthorizedError("Token de acesso ausente.");
  }
  return header.slice("Bearer ".length);
}

function requireAuth(expectedType?: UserType) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);
      const payload = verifyAccessToken(token);
      if (expectedType && payload.type !== expectedType) {
        throw new UnauthorizedError("Tipo de usuário não autorizado para esta rota.");
      }
      req.auth = payload;
      next();
    } catch {
      next(new UnauthorizedError("Sessão inválida ou expirada."));
    }
  };
}

export const requireAdminAuth = requireAuth("admin");
export const requireClientAuth = requireAuth("client");
export const requireAnyAuth = requireAuth();
