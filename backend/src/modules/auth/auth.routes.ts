import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { BadRequestError } from "../../utils/errors";
import * as authService from "./auth.service";

export function createAuthRoutes(): Router {
  const router = Router();

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const { userType, email, password } = req.body ?? {};
      if (!userType || !email || !password) {
        throw new BadRequestError("userType, email e password são obrigatórios.");
      }
      if (userType !== "admin" && userType !== "client") {
        throw new BadRequestError("userType deve ser 'admin' ou 'client'.");
      }
      const result = await authService.login(userType, email, password);
      res.json(result);
    })
  );

  router.post(
    "/refresh",
    asyncHandler(async (req, res) => {
      const { refreshToken } = req.body ?? {};
      if (!refreshToken) throw new BadRequestError("refreshToken é obrigatório.");
      const result = await authService.refresh(refreshToken);
      res.json(result);
    })
  );

  return router;
}
