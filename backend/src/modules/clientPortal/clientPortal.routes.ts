import { Router } from "express";
import { pool } from "../../db/pool";
import { requireClientAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import * as postsRepository from "../posts/posts.repository";
import { notifyAdmins } from "../notifications/push.service";

export function createClientPortalRoutes(): Router {
  const router = Router();
  router.use(requireClientAuth);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const clientId = req.auth!.sub;
      const { rows } = await pool.query(
        `SELECT id, name FROM clients WHERE id = $1`,
        [clientId]
      );
      if (rows.length === 0) throw new NotFoundError("Cliente não encontrado.");

      const [posts, feedbacks] = await Promise.all([
        postsRepository.listPostsForClient(clientId),
        postsRepository.listFeedbackForClient(clientId),
      ]);

      res.json({ client: rows[0], posts, feedbacks });
    })
  );

  router.post(
    "/posts/:postId/approve",
    asyncHandler(async (req, res) => {
      const clientId = req.auth!.sub;
      const { expectedRevision, positiveReaction } = req.body ?? {};
      if (typeof expectedRevision !== "number") {
        throw new BadRequestError("expectedRevision é obrigatório.");
      }
      const post = await postsRepository.approvePost(
        clientId,
        req.params.postId,
        expectedRevision,
        positiveReaction
      );
      notifyAdmins("Post aprovado", `Um cliente aprovou "${post.title}".`).catch(() => {});
      res.json(post);
    })
  );

  router.post(
    "/posts/:postId/reject",
    asyncHandler(async (req, res) => {
      const clientId = req.auth!.sub;
      const { expectedRevision, comment, tags } = req.body ?? {};
      if (typeof expectedRevision !== "number") {
        throw new BadRequestError("expectedRevision é obrigatório.");
      }
      if (!comment) throw new BadRequestError("comment é obrigatório.");
      const post = await postsRepository.rejectPost(
        clientId,
        req.params.postId,
        expectedRevision,
        comment,
        tags
      );
      notifyAdmins("Ajuste solicitado", `Um cliente pediu ajuste em "${post.title}".`).catch(() => {});
      res.json(post);
    })
  );

  return router;
}
