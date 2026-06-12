import { apiRequest } from "./client";
import type { Report } from "@/types";

export const reportsApi = {
  list: () => apiRequest<Report[]>("/reports"),

  generateForTrip: (tripId: string) =>
    apiRequest<Report>(`/reports/trip/${tripId}`, { method: "POST" }),

  generateMonthly: (month: string, userId?: string) =>
    apiRequest<Report>("/reports/monthly", { method: "POST", body: { month, userId } }),

  download: (id: string) =>
    apiRequest<{ url: string }>(`/reports/${id}/download`),

  send: (id: string, to?: string) =>
    apiRequest<void>(`/reports/${id}/send`, { method: "POST", body: { to } }),
};
