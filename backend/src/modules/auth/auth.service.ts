import { pool } from "../../db/pool";
import { comparePassword } from "../../utils/passwords";
import { signAccessToken, signRefreshToken, verifyRefreshToken, UserType } from "../../utils/jwt";
import { UnauthorizedError } from "../../utils/errors";

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  type: UserType;
}

interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

async function findUser(userType: UserType, email: string) {
  const table = userType === "admin" ? "admins" : "clients";
  const { rows } = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
  return rows[0] ?? null;
}

function issueTokens(id: string, type: UserType) {
  return {
    accessToken: signAccessToken({ sub: id, type }),
    refreshToken: signRefreshToken({ sub: id, type }),
  };
}

export async function login(userType: UserType, email: string, password: string): Promise<AuthResult> {
  const row = await findUser(userType, email);
  if (!row) throw new UnauthorizedError("Credenciais inválidas.");

  const valid = await comparePassword(password, row.password_hash);
  if (!valid) throw new UnauthorizedError("Credenciais inválidas.");

  if (userType === "client" && row.active === false) {
    throw new UnauthorizedError("Cliente inativo.");
  }

  const tokens = issueTokens(row.id, userType);
  return {
    ...tokens,
    user: { id: row.id, email: row.email, name: row.name, type: userType },
  };
}

export async function refresh(refreshToken: string): Promise<AuthResult> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError("Refresh token inválido ou expirado.");
  }

  const table = payload.type === "admin" ? "admins" : "clients";
  const { rows } = await pool.query(`SELECT * FROM ${table} WHERE id = $1`, [payload.sub]);
  const row = rows[0];
  if (!row) throw new UnauthorizedError("Usuário não encontrado.");

  const tokens = issueTokens(row.id, payload.type);
  return {
    ...tokens,
    user: { id: row.id, email: row.email, name: row.name, type: payload.type },
  };
}
