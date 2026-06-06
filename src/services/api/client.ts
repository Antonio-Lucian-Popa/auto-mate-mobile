import Constants from "expo-constants";
import { tokenStorage } from "@/services/storage/secureStorage";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as any)?.apiUrl ??
  "http://localhost:3000/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  onUnauthorized = fn;
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = (async () => {
    try {
      const refreshToken = await tokenStorage.getRefresh();
      if (!refreshToken) return false;
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (!data.accessToken) return false;
      await tokenStorage.save(data.accessToken, data.refreshToken ?? refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

type RequestOptions = { method?: string; body?: unknown; auth?: boolean; _retried?: boolean };

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = opts;
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = await tokenStorage.getAccess();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Refresh automat la 401, o singura reincercare
  if (res.status === 401 && auth && !opts._retried) {
    const ok = await refreshTokens();
    if (ok) return apiRequest<T>(path, { ...opts, _retried: true });
    await tokenStorage.clear();
    onUnauthorized?.();
    throw new ApiError(401, "Sesiune expirată. Te rugăm să te autentifici din nou.");
  }

  if (!res.ok) {
    let msg = "A apărut o eroare. Încearcă din nou.";
    try {
      const err = await res.json();
      msg = err.message ?? msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const API_BASE_URL = BASE_URL;
