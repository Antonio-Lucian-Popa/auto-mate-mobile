import { apiRequest } from "./client";
import type { Reminder } from "@/types";

export type ReminderInput = Omit<Reminder, "id" | "status">;

export const remindersApi = {
  listAll: () => apiRequest<Reminder[]>("/reminders"),
  listByCar: (carId: string) => apiRequest<Reminder[]>(`/reminders/car/${carId}`),
  create: (carId: string, data: Omit<ReminderInput, "carId">) =>
    apiRequest<Reminder>(`/reminders/car/${carId}`, { method: "POST", body: data }),
  update: (id: string, data: Partial<ReminderInput>) =>
    apiRequest<Reminder>(`/reminders/${id}`, { method: "PATCH", body: data }),
  renew: (id: string, body?: { dueDate?: string }) =>
    apiRequest<Reminder>(`/reminders/${id}/renew`, { method: "POST", body: body ?? {} }),
  remove: (id: string) => apiRequest<void>(`/reminders/${id}`, { method: "DELETE" }),
};
