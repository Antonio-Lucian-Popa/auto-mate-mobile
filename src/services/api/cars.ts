import { apiRequest } from "./client";
import type { Car } from "@/types";

export type CarInput = Omit<Car, "id" | "createdAt">;

export const carsApi = {
  list: () => apiRequest<Car[]>("/cars"),
  get: (id: string) => apiRequest<Car>(`/cars/${id}`),
  create: (data: CarInput) => apiRequest<Car>("/cars", { method: "POST", body: data }),
  update: (id: string, data: Partial<CarInput>) => apiRequest<Car>(`/cars/${id}`, { method: "PATCH", body: data }),
  remove: (id: string) => apiRequest<void>(`/cars/${id}`, { method: "DELETE" }),
};
