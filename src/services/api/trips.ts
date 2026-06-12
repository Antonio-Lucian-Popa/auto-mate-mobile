import { apiRequest } from "./client";
import type { Trip } from "@/types";

export type TripInput = {
  destination: string;
  purpose?: string;
  startDate: string;
  endDate?: string;
  budget?: number;
  carId?: string;
  kmStart?: number;
};

export type TripFilters = {
  status?: string;
  userId?: string;
  from?: string;
  to?: string;
};

export const tripsApi = {
  list: (filters?: TripFilters) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.userId) params.set("userId", filters.userId);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    const qs = params.toString();
    return apiRequest<Trip[]>(`/trips${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => apiRequest<Trip>(`/trips/${id}`),

  create: (data: TripInput) =>
    apiRequest<Trip>("/trips", { method: "POST", body: data }),

  update: (id: string, data: Partial<TripInput>) =>
    apiRequest<Trip>(`/trips/${id}`, { method: "PATCH", body: data }),

  close: (id: string, kmEnd?: number) =>
    apiRequest<Trip>(`/trips/${id}/close`, { method: "POST", body: { kmEnd } }),

  submit: (id: string) =>
    apiRequest<Trip>(`/trips/${id}/submit`, { method: "POST" }),

  approve: (id: string) =>
    apiRequest<Trip>(`/trips/${id}/approve`, { method: "POST" }),

  reject: (id: string, reason: string) =>
    apiRequest<Trip>(`/trips/${id}/reject`, { method: "POST", body: { reason } }),
};
