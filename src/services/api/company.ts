import { apiRequest } from "./client";
import type { Company } from "@/types";

export const companyApi = {
  get: () => apiRequest<Company>("/company"),

  update: (data: Partial<Omit<Company, "id">>) =>
    apiRequest<Company>("/company", { method: "PATCH", body: data }),
};
