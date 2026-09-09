import fs from "fs";
import path from "path";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const PUBLIC_HOST = process.env.PUBLIC_HOST ?? "http://localhost:4000";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL não configurado. Copie .env.example para .env.");
}

async function run() {
  const pool = new Pool({ connectionString: DATABASE_URL });

  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const seed = fs
    .readFileSync(path.join(__dirname, "seed.sql"), "utf8")
    .replaceAll("__PUBLIC_HOST__", PUBLIC_HOST);

  console.log("Aplicando schema...");
  await pool.query(schema);

  console.log("Aplicando seed...");
  await pool.query(seed);

  console.log("Banco pronto. PUBLIC_HOST usado nas URLs de mídia:", PUBLIC_HOST);
  await pool.end();
}

run().catch((err) => {
  console.error("Falha ao aplicar schema/seed:", err);
  process.exit(1);
});
