import { NextFunction, Request, Response } from "express";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = (err as { status?: number })?.status ?? 500;
  const message = err instanceof Error ? err.message : "Erro interno";

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ error: message });
}
