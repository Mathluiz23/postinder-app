import { Router } from "express";
import { requireAnyAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { BadRequestError } from "../../utils/errors";
import { registerPushToken } from "./push.service";

export function createNotificationsRoutes(): Router {
  const router = Router();
  router.use(requireAnyAuth);

  router.post(
    "/register-token",
    asyncHandler(async (req, res) => {
      const { token } = req.body ?? {};
      if (!token) throw new BadRequestError("token é obrigatório.");
      await registerPushToken(req.auth!.type, req.auth!.sub, token);
      res.status(204).end();
    })
  );

  return router;
}
