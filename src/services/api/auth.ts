import { apiRequest } from "./client";
import type { AuthTokens, User } from "@/types";

type BackendUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
};

type BackendAuthResponse = AuthTokens & { user?: BackendUser };
type AuthResponse = AuthTokens & { user?: User };

function mapUser(user?: BackendUser | null): User | undefined {
  if (!user) return undefined;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? (fullName || undefined),
  };
}

function mapAuthResponse(res: BackendAuthResponse): AuthResponse {
  return { ...res, user: mapUser(res.user) };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<BackendAuthResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false }).then(mapAuthResponse),

  register: (email: string, password: string, name?: string) =>
    apiRequest<BackendAuthResponse>("/auth/register", { method: "POST", body: { email, password, firstName: name }, auth: false }).then(mapAuthResponse),

  me: () =>
    apiRequest<BackendUser>("/users/me").then(mapUser),

  logout: (refreshToken: string) =>
    apiRequest<void>("/auth/logout", { method: "POST", body: { refreshToken } }),
};
