import { Router } from "express";
import { pool } from "../../db/pool";
import { requireAdminAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";

export function createMetricsRoutes(): Router {
  const router = Router();
  router.use(requireAdminAuth);

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const { rows } = await pool.query(
        `SELECT clients.id AS client_id, clients.name AS client_name, posts.status, COUNT(*) AS count
         FROM posts
         JOIN clients ON clients.id = posts.client_id
         GROUP BY clients.id, clients.name, posts.status`
      );

      const totalsByStatus: Record<string, number> = {};
      const byClientMap = new Map<string, { clientId: string; clientName: string; totalsByStatus: Record<string, number> }>();

      for (const row of rows) {
        const count = Number(row.count);
        totalsByStatus[row.status] = (totalsByStatus[row.status] ?? 0) + count;

        if (!byClientMap.has(row.client_id)) {
          byClientMap.set(row.client_id, {
            clientId: row.client_id,
            clientName: row.client_name,
            totalsByStatus: {},
          });
        }
        byClientMap.get(row.client_id)!.totalsByStatus[row.status] = count;
      }

      res.json({
        totalsByStatus,
        totalPosts: Object.values(totalsByStatus).reduce((a, b) => a + b, 0),
        byClient: Array.from(byClientMap.values()),
      });
    })
  );

  return router;
}
