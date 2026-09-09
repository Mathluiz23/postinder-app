import axios, { AxiosInstance } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export const ENDPOINTS = {
  login: "/api/v1/auth/login",
  refresh: "/api/v1/auth/refresh",

  clientPortal: "/api/v1/client-portal",
  clientPortalApprove: (postId: string) =>
    `/api/v1/client-portal/posts/${postId}/approve`,
  clientPortalReject: (postId: string) =>
    `/api/v1/client-portal/posts/${postId}/reject`,

  publicPortal: (token: string) => `/api/v1/portal/${token}`,
  publicPortalPosts: (token: string) => `/api/v1/portal/${token}/posts`,
  publicPortalApprove: (token: string, postId: string) =>
    `/api/v1/portal/${token}/posts/${postId}/approve`,
  publicPortalReject: (token: string, postId: string) =>
    `/api/v1/portal/${token}/posts/${postId}/reject`,

  adminApprovalsQueue: "/api/v1/approvals/queue",
  adminClients: "/api/v1/clients",
  adminClient: (clientId: string) => `/api/v1/clients/${clientId}`,
  adminPosts: "/api/v1/posts",
  adminPostsByStatus: (status: string) => `/api/v1/posts?status=${encodeURIComponent(status)}`,
  adminPost: (postId: string) => `/api/v1/posts/${postId}`,
  adminNotifications: "/api/v1/notifications",
  adminMetrics: "/api/v1/metrics",
  registerPushToken: "/api/v1/notifications/register-token",
};

const ACCESS_TOKEN_KEY = "@postinder/token";
const REFRESH_TOKEN_KEY = "@postinder/refreshToken";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

export async function loadStoredToken() {
  [accessToken, refreshToken] = await Promise.all([
    AsyncStorage.getItem(ACCESS_TOKEN_KEY),
    AsyncStorage.getItem(REFRESH_TOKEN_KEY),
  ]);
  return accessToken;
}

export async function storeTokens(newAccessToken: string, newRefreshToken: string) {
  accessToken = newAccessToken;
  refreshToken = newRefreshToken;
  await Promise.all([
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken),
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken),
  ]);
}

export async function clearToken() {
  accessToken = null;
  refreshToken = null;
  await Promise.all([
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
    AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
  ]);
}

function createClient(): AxiosInstance {
  const instance = axios.create({ baseURL: API_BASE_URL, timeout: 15000 });

  instance.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  let refreshPromise: Promise<string | null> | null = null;

  async function doRefresh(): Promise<string | null> {
    if (!refreshToken) return null;
    try {
      const { data } = await axios.post(`${API_BASE_URL}${ENDPOINTS.refresh}`, {
        refreshToken,
      });
      await storeTokens(data.accessToken, data.refreshToken);
      return data.accessToken as string;
    } catch {
      return null;
    }
  }

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const original = error.config;
      const status = error.response?.status;

      if (status !== 401 || original?._retried || !refreshToken) {
        return Promise.reject(error);
      }
      original._retried = true;

      refreshPromise = refreshPromise ?? doRefresh();
      const newAccessToken = await refreshPromise;
      refreshPromise = null;

      if (!newAccessToken) {
        await clearToken();
        onUnauthorized?.();
        return Promise.reject(error);
      }

      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${newAccessToken}`;
      return instance.request(original);
    }
  );

  return instance;
}

export const api = createClient();
