import { apiRequest } from "./client";
import type { AuthTokens, User, Company } from "@/types";

type BackendUser = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  companyId?: string;
  role?: User["role"];
  isActive?: boolean;
};

type BackendAuthResponse = AuthTokens & {
  user?: BackendUser;
  company?: Company;
};

type AuthResponse = AuthTokens & { user?: User };

function mapUser(user?: BackendUser | null): User | undefined {
  if (!user) return undefined;
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? (fullName || undefined),
    companyId: user.companyId,
    role: user.role,
    isActive: user.isActive,
  };
}

function mapAuthResponse(res: BackendAuthResponse): AuthResponse {
  return { ...res, user: mapUser(res.user) };
}

export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<BackendAuthResponse>("/auth/login", { method: "POST", body: { email, password }, auth: false }).then(mapAuthResponse),

  register: (email: string, password: string, firstName?: string, companyName?: string) =>
    apiRequest<BackendAuthResponse>("/auth/register", {
      method: "POST",
      body: { email, password, firstName, companyName },
      auth: false,
    }).then(mapAuthResponse),

  me: () =>
    apiRequest<BackendUser>("/users/me").then(mapUser),

  logout: (refreshToken: string) =>
    apiRequest<void>("/auth/logout", { method: "POST", body: { refreshToken } }),
};
