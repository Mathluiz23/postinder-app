import { api, ENDPOINTS, storeTokens, clearToken } from "./api";
import { storeUser, clearUser } from "./authStore";
import { AuthResponse, UserType } from "../types";

async function login(userType: UserType, email: string, password: string) {
  const { data } = await api.post<AuthResponse>(ENDPOINTS.login, {
    userType,
    email,
    password,
  });
  await Promise.all([storeTokens(data.accessToken, data.refreshToken), storeUser(data.user)]);
  return data;
}

export function loginClient(email: string, password: string) {
  return login("client", email, password);
}

export function loginAdmin(email: string, password: string) {
  return login("admin", email, password);
}

export async function refreshSession(refreshToken: string) {
  const { data } = await api.post<AuthResponse>(ENDPOINTS.refresh, {
    refreshToken,
  });
  await Promise.all([storeTokens(data.accessToken, data.refreshToken), storeUser(data.user)]);
  return data;
}

export async function logout() {
  await Promise.all([clearToken(), clearUser()]);
}
