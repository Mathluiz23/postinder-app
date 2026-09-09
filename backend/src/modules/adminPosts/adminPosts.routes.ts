import { Router } from "express";
import multer from "multer";
import path from "path";
import crypto from "crypto";
import { requireAdminAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { BadRequestError } from "../../utils/errors";
import { inferFileType } from "../../utils/fileType";
import { env } from "../../config/env";
import * as postsRepository from "../posts/posts.repository";
import { notifyClient } from "../notifications/push.service";

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "..", "..", "..", "public", "uploads"),
    filename: (_req, file, cb) => {
      const unique = crypto.randomUUID();
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

export function createAdminPostsRoutes(): Router {
  const router = Router();
  router.use(requireAdminAuth);

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      const status = typeof req.query.status === "string" ? req.query.status : undefined;
      const posts = await postsRepository.listAllPosts(status);
      res.json(posts);
    })
  );

  router.post(
    "/",
    upload.array("files", 10),
    asyncHandler(async (req, res) => {
      const { clientId, title, description, channels } = req.body ?? {};
      if (!clientId || !title) {
        throw new BadRequestError("clientId e title são obrigatórios.");
      }

      let parsedChannels: string[] = [];
      if (channels) {
        try {
          parsedChannels = JSON.parse(channels);
        } catch {
          throw new BadRequestError("channels deve ser um JSON de array de strings.");
        }
      }

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      const fileEntries = files.map((file) => ({
        name: file.originalname,
        url: `${env.publicHost}/uploads/${file.filename}`,
        file_type: inferFileType(file.mimetype),
        mime_type: file.mimetype,
      }));

      const post = await postsRepository.createPost({
        clientId,
        title,
        description,
        status: "pending_approval",
        channels: parsedChannels,
        files: fileEntries,
      });

      notifyClient(clientId, "Novo post para aprovar", `"${post.title}" está aguardando sua aprovação.`).catch(
        () => {}
      );

      res.status(201).json(post);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const [post, feedback] = await Promise.all([
        postsRepository.getPostById(req.params.id),
        postsRepository.listFeedbackForPost(req.params.id),
      ]);
      res.json({ ...post, feedback });
    })
  );

  router.patch(
    "/:id",
    upload.array("files", 10),
    asyncHandler(async (req, res) => {
      const { title, description, channels, status } = req.body ?? {};

      let parsedChannels: string[] | undefined;
      if (channels !== undefined) {
        try {
          parsedChannels = JSON.parse(channels);
        } catch {
          throw new BadRequestError("channels deve ser um JSON de array de strings.");
        }
      }

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      const newFiles = files.map((file) => ({
        name: file.originalname,
        url: `${env.publicHost}/uploads/${file.filename}`,
        file_type: inferFileType(file.mimetype),
        mime_type: file.mimetype,
      }));

      const post = await postsRepository.updatePostMeta(req.params.id, {
        title,
        description,
        channels: parsedChannels,
        status,
        newFiles,
      });

      if (status === "pending_approval") {
        notifyClient(
          post.clientId,
          "Post atualizado para aprovação",
          `"${post.title}" foi corrigido e está aguardando sua aprovação novamente.`
        ).catch(() => {});
      }

      res.json(post);
    })
  );

  return router;
}
