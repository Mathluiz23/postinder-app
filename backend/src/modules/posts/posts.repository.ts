import { PoolClient } from "pg";
import { pool } from "../../db/pool";
import { NotFoundError, ConflictError } from "../../utils/errors";

export interface PostFileDTO {
  id: string;
  name: string;
  url: string | null;
  storage_url: string | null;
  file_type: string;
  mime_type: string;
}

export interface PostDTO {
  id: string;
  clientId: string;
  clientName?: string;
  title: string;
  description?: string;
  status: string;
  channels: string[];
  formats: Record<string, string[]>;
  scheduledDate: string | null;
  createdAt: string;
  updatedAt: string;
  contentRevision: number;
  approvedRevision: number | null;
  positiveReaction: "loved" | null;
  emailLink: string | null;
  files: PostFileDTO[];
}

function mapPostRow(row: any, files: PostFileDTO[]): PostDTO {
  return {
    id: row.id,
    clientId: row.client_id,
    clientName: row.client_name ?? undefined,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    channels: row.channels ?? [],
    formats: row.formats ?? {},
    scheduledDate: row.scheduled_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    contentRevision: row.content_revision,
    approvedRevision: row.approved_revision,
    positiveReaction: row.positive_reaction,
    emailLink: row.email_link,
    files,
  };
}

async function filesForPosts(postIds: string[]): Promise<Map<string, PostFileDTO[]>> {
  const map = new Map<string, PostFileDTO[]>();
  if (postIds.length === 0) return map;

  const { rows } = await pool.query(
    `SELECT id, post_id, name, url, storage_url, file_type, mime_type
     FROM post_files WHERE post_id = ANY($1) ORDER BY position ASC`,
    [postIds]
  );

  for (const row of rows) {
    const list = map.get(row.post_id) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      url: row.url,
      storage_url: row.storage_url,
      file_type: row.file_type,
      mime_type: row.mime_type,
    });
    map.set(row.post_id, list);
  }
  return map;
}

export async function listPostsForClient(clientId: string): Promise<PostDTO[]> {
  const { rows } = await pool.query(
    `SELECT * FROM posts WHERE client_id = $1 ORDER BY created_at DESC`,
    [clientId]
  );
  const filesByPost = await filesForPosts(rows.map((r) => r.id));
  return rows.map((row) => mapPostRow(row, filesByPost.get(row.id) ?? []));
}

export async function listFeedbackForClient(clientId: string) {
  const { rows } = await pool.query(
    `SELECT f.id, f.post_id, f.comment, f.tags, f.created_at
     FROM post_feedback f
     JOIN posts p ON p.id = f.post_id
     WHERE p.client_id = $1
     ORDER BY f.created_at DESC`,
    [clientId]
  );
  return rows;
}

export async function listPendingApprovalQueue(): Promise<PostDTO[]> {
  const { rows } = await pool.query(
    `SELECT posts.*, clients.name AS client_name
     FROM posts
     JOIN clients ON clients.id = posts.client_id
     WHERE posts.status = 'pending_approval'
     ORDER BY posts.created_at ASC`
  );
  const filesByPost = await filesForPosts(rows.map((r) => r.id));
  return rows.map((row) => mapPostRow(row, filesByPost.get(row.id) ?? []));
}

export async function listAllPosts(status?: string): Promise<PostDTO[]> {
  const { rows } = status
    ? await pool.query(
        `SELECT posts.*, clients.name AS client_name FROM posts
         JOIN clients ON clients.id = posts.client_id
         WHERE posts.status = $1 ORDER BY posts.created_at DESC`,
        [status]
      )
    : await pool.query(
        `SELECT posts.*, clients.name AS client_name FROM posts
         JOIN clients ON clients.id = posts.client_id
         ORDER BY posts.created_at DESC`
      );
  const filesByPost = await filesForPosts(rows.map((r) => r.id));
  return rows.map((row) => mapPostRow(row, filesByPost.get(row.id) ?? []));
}

export async function listFeedbackForPost(postId: string) {
  const { rows } = await pool.query(
    `SELECT id, comment, tags, created_at FROM post_feedback
     WHERE post_id = $1 ORDER BY created_at DESC`,
    [postId]
  );
  return rows.map((row) => ({ id: row.id, comment: row.comment, tags: row.tags, createdAt: row.created_at }));
}

export async function getPostById(postId: string): Promise<PostDTO> {
  const { rows } = await pool.query(
    `SELECT posts.*, clients.name AS client_name FROM posts
     JOIN clients ON clients.id = posts.client_id WHERE posts.id = $1`,
    [postId]
  );
  if (rows.length === 0) throw new NotFoundError("Post não encontrado.");
  const filesByPost = await filesForPosts([postId]);
  return mapPostRow(rows[0], filesByPost.get(postId) ?? []);
}

export async function updatePostMeta(
  postId: string,
  input: {
    title?: string;
    description?: string;
    channels?: string[];
    status?: string;
    newFiles?: { name: string; url: string; file_type: string; mime_type: string }[];
  }
): Promise<PostDTO> {
  const client = await pool.connect();
  try {
    const fields: string[] = [];
    const values: unknown[] = [];
    function set(column: string, value: unknown) {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    }
    if (input.title !== undefined) set("title", input.title);
    if (input.description !== undefined) set("description", input.description);
    if (input.channels !== undefined) set("channels", input.channels);
    if (input.status !== undefined) {
      set("status", input.status);
      if (input.status === "pending_approval") {
        fields.push("content_revision = content_revision + 1");
        set("positive_reaction", null);
      }
    }

    if (fields.length > 0) {
      values.push(postId);
      const result = await client.query(
        `UPDATE posts SET ${fields.join(", ")}, updated_at = now() WHERE id = $${values.length} RETURNING id`,
        values
      );
      if (result.rowCount === 0) throw new NotFoundError("Post não encontrado.");
    }

    if (input.newFiles?.length) {
      const { rows: existing } = await client.query(
        `SELECT COALESCE(MAX(position), -1) AS max_position FROM post_files WHERE post_id = $1`,
        [postId]
      );
      let position = Number(existing[0].max_position) + 1;
      for (const file of input.newFiles) {
        await client.query(
          `INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
           VALUES ($1, $2, $3, $3, $4, $5, $6)`,
          [postId, file.name, file.url, file.file_type, file.mime_type, position++]
        );
      }
    }

    return await loadSinglePost(client, postId);
  } finally {
    client.release();
  }
}

async function loadSinglePost(client: PoolClient, postId: string): Promise<PostDTO> {
  const { rows } = await client.query(
    `SELECT posts.*, clients.name AS client_name FROM posts
     JOIN clients ON clients.id = posts.client_id WHERE posts.id = $1`,
    [postId]
  );
  if (rows.length === 0) throw new NotFoundError("Post não encontrado.");
  const filesByPost = await filesForPosts([postId]);
  return mapPostRow(rows[0], filesByPost.get(postId) ?? []);
}

export async function approvePost(
  clientId: string,
  postId: string,
  expectedRevision: number,
  positiveReaction?: "loved"
): Promise<PostDTO> {
  const client = await pool.connect();
  try {
    const exists = await client.query(
      `SELECT id FROM posts WHERE id = $1 AND client_id = $2`,
      [postId, clientId]
    );
    if (exists.rowCount === 0) throw new NotFoundError("Post não encontrado.");

    const result = await client.query(
      `UPDATE posts
       SET status = 'approved', approved_revision = content_revision,
           positive_reaction = $3, updated_at = now()
       WHERE id = $1 AND client_id = $2 AND content_revision = $4
       RETURNING id`,
      [postId, clientId, positiveReaction ?? null, expectedRevision]
    );
    if (result.rowCount === 0) {
      throw new ConflictError("Este post foi atualizado. Recarregue a fila.");
    }

    return await loadSinglePost(client, postId);
  } finally {
    client.release();
  }
}

export async function rejectPost(
  clientId: string,
  postId: string,
  expectedRevision: number,
  comment: string,
  tags?: string[]
): Promise<PostDTO> {
  const client = await pool.connect();
  try {
    const exists = await client.query(
      `SELECT id FROM posts WHERE id = $1 AND client_id = $2`,
      [postId, clientId]
    );
    if (exists.rowCount === 0) throw new NotFoundError("Post não encontrado.");

    const result = await client.query(
      `UPDATE posts
       SET status = 'rejected', updated_at = now()
       WHERE id = $1 AND client_id = $2 AND content_revision = $3
       RETURNING id`,
      [postId, clientId, expectedRevision]
    );
    if (result.rowCount === 0) {
      throw new ConflictError("Este post foi atualizado. Recarregue a fila.");
    }

    await client.query(
      `INSERT INTO post_feedback (post_id, comment, tags) VALUES ($1, $2, $3)`,
      [postId, comment, tags ?? null]
    );

    return await loadSinglePost(client, postId);
  } finally {
    client.release();
  }
}

export async function createPost(input: {
  clientId: string;
  title: string;
  description?: string;
  status: string;
  channels?: string[];
  files: { name: string; url: string; file_type: string; mime_type: string }[];
}): Promise<PostDTO> {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `INSERT INTO posts (client_id, title, description, status, channels)
       VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [input.clientId, input.title, input.description ?? null, input.status, input.channels ?? []]
    );
    const postId = rows[0].id;

    for (let i = 0; i < input.files.length; i++) {
      const file = input.files[i];
      await client.query(
        `INSERT INTO post_files (post_id, name, url, storage_url, file_type, mime_type, position)
         VALUES ($1, $2, $3, $3, $4, $5, $6)`,
        [postId, file.name, file.url, file.file_type, file.mime_type, i]
      );
    }

    return await loadSinglePost(client, postId);
  } finally {
    client.release();
  }
}
