import bcrypt from "bcryptjs";

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}
