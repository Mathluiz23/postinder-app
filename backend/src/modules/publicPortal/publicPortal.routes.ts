import { Router } from "express";
import { pool } from "../../db/pool";
import { asyncHandler } from "../../middleware/asyncHandler";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import * as postsRepository from "../posts/posts.repository";
import { notifyAdmins } from "../notifications/push.service";

async function resolveClientByToken(token: string) {
  const { rows } = await pool.query(
    `SELECT id, name FROM clients WHERE portal_token = $1 AND active = true`,
    [token]
  );
  if (rows.length === 0) throw new NotFoundError("Link de aprovação inválido ou expirado.");
  return rows[0];
}

export function createPublicPortalRoutes(): Router {
  const router = Router();

  router.get(
    "/:token",
    asyncHandler(async (req, res) => {
      const client = await resolveClientByToken(req.params.token);
      const [posts, feedbacks] = await Promise.all([
        postsRepository.listPostsForClient(client.id),
        postsRepository.listFeedbackForClient(client.id),
      ]);
      res.json({ client, posts, feedbacks });
    })
  );

  router.post(
    "/:token/posts/:postId/approve",
    asyncHandler(async (req, res) => {
      const client = await resolveClientByToken(req.params.token);
      const { expectedRevision, positiveReaction } = req.body ?? {};
      if (typeof expectedRevision !== "number") {
        throw new BadRequestError("expectedRevision é obrigatório.");
      }
      const post = await postsRepository.approvePost(
        client.id,
        req.params.postId,
        expectedRevision,
        positiveReaction
      );
      notifyAdmins("Post aprovado", `Um cliente aprovou "${post.title}" pelo link público.`).catch(() => {});
      res.json(post);
    })
  );

  router.post(
    "/:token/posts/:postId/reject",
    asyncHandler(async (req, res) => {
      const client = await resolveClientByToken(req.params.token);
      const { expectedRevision, comment, tags } = req.body ?? {};
      if (typeof expectedRevision !== "number") {
        throw new BadRequestError("expectedRevision é obrigatório.");
      }
      if (!comment) throw new BadRequestError("comment é obrigatório.");
      const post = await postsRepository.rejectPost(
        client.id,
        req.params.postId,
        expectedRevision,
        comment,
        tags
      );
      notifyAdmins("Ajuste solicitado", `Um cliente pediu ajuste em "${post.title}" pelo link público.`).catch(() => {});
      res.json(post);
    })
  );

  return router;
}
