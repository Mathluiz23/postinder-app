import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { pool } from "../../db/pool";

const expo = new Expo();

async function sendToTokens(tokens: string[], title: string, body: string, data?: Record<string, unknown>) {
  const messages: ExpoPushMessage[] = tokens
    .filter((token) => Expo.isExpoPushToken(token))
    .map((to) => ({ to, sound: "default", title, body, data }));

  if (messages.length === 0) return;

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      const tickets = await expo.sendPushNotificationsAsync(chunk);
      console.log("Push enviado:", tickets);
    } catch (err) {
      console.error("Falha ao enviar push:", err);
    }
  }
}

export async function registerPushToken(ownerType: "admin" | "client", ownerId: string, token: string) {
  await pool.query(
    `INSERT INTO push_tokens (owner_type, owner_id, expo_push_token)
     VALUES ($1, $2, $3)
     ON CONFLICT (owner_type, owner_id, expo_push_token) DO NOTHING`,
    [ownerType, ownerId, token]
  );
}

export async function notifyClient(clientId: string, title: string, body: string) {
  const { rows } = await pool.query(
    `SELECT expo_push_token FROM push_tokens WHERE owner_type = 'client' AND owner_id = $1`,
    [clientId]
  );
  await sendToTokens(rows.map((r) => r.expo_push_token), title, body, { clientId });
}

export async function notifyAdmins(title: string, body: string) {
  const { rows } = await pool.query(
    `SELECT expo_push_token FROM push_tokens WHERE owner_type = 'admin'`
  );
  await sendToTokens(rows.map((r) => r.expo_push_token), title, body);
}
