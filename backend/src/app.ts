import express from "express";
import cors from "cors";
import path from "path";
import { createAuthRoutes } from "./modules/auth/auth.routes";
import { createClientPortalRoutes } from "./modules/clientPortal/clientPortal.routes";
import { createPublicPortalRoutes } from "./modules/publicPortal/publicPortal.routes";
import { createApprovalsRoutes } from "./modules/approvals/approvals.routes";
import { createClientsRoutes } from "./modules/clients/clients.routes";
import { createAdminPostsRoutes } from "./modules/adminPosts/adminPosts.routes";
import { createNotificationsRoutes } from "./modules/notifications/notifications.routes";
import { createMetricsRoutes } from "./modules/metrics/metrics.routes";
import { errorHandler } from "./middleware/errorHandler";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/seed-media", express.static(path.join(__dirname, "..", "public", "seed-media")));
  app.use("/uploads", express.static(path.join(__dirname, "..", "public", "uploads")));

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/v1/auth", createAuthRoutes());
  app.use("/api/v1/client-portal", createClientPortalRoutes());
  app.use("/api/v1/portal", createPublicPortalRoutes());
  app.use("/api/v1/approvals", createApprovalsRoutes());
  app.use("/api/v1/clients", createClientsRoutes());
  app.use("/api/v1/posts", createAdminPostsRoutes());
  app.use("/api/v1/notifications", createNotificationsRoutes());
  app.use("/api/v1/metrics", createMetricsRoutes());

  app.use(errorHandler);

  return app;
}
