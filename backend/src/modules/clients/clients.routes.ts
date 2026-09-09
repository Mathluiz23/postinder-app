import { Router } from "express";
import crypto from "crypto";
import { pool } from "../../db/pool";
import { requireAdminAuth } from "../../middleware/auth";
import { asyncHandler } from "../../middleware/asyncHandler";
import { BadRequestError, NotFoundError } from "../../utils/errors";
import { hashPassword } from "../../utils/passwords";

function mapClientRow(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    active: row.active,
    brandColor: row.brand_color,
  };
}

export function createClientsRoutes(): Router {
  const router = Router();
  router.use(requireAdminAuth);

  router.get(
    "/",
    asyncHandler(async (_req, res) => {
      const { rows } = await pool.query(
        `SELECT id, name, email, active, brand_color FROM clients ORDER BY name ASC`
      );
      res.json(rows.map(mapClientRow));
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      const { rows } = await pool.query(
        `SELECT id, name, email, active, brand_color FROM clients WHERE id = $1`,
        [req.params.id]
      );
      if (rows.length === 0) throw new NotFoundError("Cliente não encontrado.");
      res.json(mapClientRow(rows[0]));
    })
  );

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      const { name, email, password, brandColor } = req.body ?? {};
      if (!name || !email || !password) {
        throw new BadRequestError("name, email e password são obrigatórios.");
      }

      const passwordHash = await hashPassword(password);
      const portalToken = crypto.randomUUID();

      try {
        const { rows } = await pool.query(
          `INSERT INTO clients (name, email, password_hash, portal_token, brand_color)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, name, email, active, brand_color`,
          [name, email, passwordHash, portalToken, brandColor ?? null]
        );
        res.status(201).json(mapClientRow(rows[0]));
      } catch (err: any) {
        if (err.code === "23505") throw new BadRequestError("Já existe um cliente com esse email.");
        throw err;
      }
    })
  );

  router.patch(
    "/:id",
    asyncHandler(async (req, res) => {
      const { name, email, password, brandColor, active } = req.body ?? {};

      const fields: string[] = [];
      const values: unknown[] = [];
      function set(column: string, value: unknown) {
        values.push(value);
        fields.push(`${column} = $${values.length}`);
      }

      if (name !== undefined) set("name", name);
      if (email !== undefined) set("email", email);
      if (brandColor !== undefined) set("brand_color", brandColor);
      if (active !== undefined) set("active", active);
      if (password) set("password_hash", await hashPassword(password));

      if (fields.length === 0) throw new BadRequestError("Nada para atualizar.");

      values.push(req.params.id);
      const { rows } = await pool.query(
        `UPDATE clients SET ${fields.join(", ")} WHERE id = $${values.length}
         RETURNING id, name, email, active, brand_color`,
        values
      );
      if (rows.length === 0) throw new NotFoundError("Cliente não encontrado.");
      res.json(mapClientRow(rows[0]));
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      const { rowCount } = await pool.query(`DELETE FROM clients WHERE id = $1`, [req.params.id]);
      if (rowCount === 0) throw new NotFoundError("Cliente não encontrado.");
      res.status(204).end();
    })
  );

  return router;
}
