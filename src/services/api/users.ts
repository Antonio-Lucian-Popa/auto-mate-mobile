import { apiRequest } from "./client";
import type { CompanyUser, UserRole } from "@/types";

export type InviteInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  role: Exclude<UserRole, "ADMIN">;
};

export const usersApi = {
  list: () => apiRequest<CompanyUser[]>("/users"),

  invite: (data: InviteInput) =>
    apiRequest<{ user: CompanyUser; temporaryPassword: string }>("/users/invite", {
      method: "POST",
      body: data,
    }),
};
