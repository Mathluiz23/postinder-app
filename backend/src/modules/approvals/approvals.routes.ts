import { Router } from "express";
import { requireAdminAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import * as postsRepository from "../posts/posts.repository";

export function createApprovalsRoutes(): Router {
  const router = Router();
  router.use(requireAdminAuth);

  router.get(
    "/queue",
    asyncHandler(async (_req, res) => {
      const queue = await postsRepository.listPendingApprovalQueue();
      res.json(queue);
    })
  );

  return router;
}
