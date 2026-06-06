import { apiRequest } from "./client";
import type { AuthTokens, User } from "@/types";

type AuthResponse = AuthTokens & { user?: User };

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<AuthResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false }),

  register: (email: string, password: string, name?: string) =>
    apiRequest<AuthResponse>("/auth/register", { method: "POST", body: { email, password, name }, auth: false }),

  logout: (refreshToken: string) =>
    apiRequest<void>("/auth/logout", { method: "POST", body: { refreshToken } }),
};
