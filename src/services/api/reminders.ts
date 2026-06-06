import { apiRequest } from "./client";
import type { Reminder } from "@/types";

export type ReminderInput = Omit<Reminder, "id" | "status">;

type BackendReminder = Omit<Reminder, "dueDate"> & {
  dueDate?: string;
  expiresAt?: string;
};

type ReminderCreateInput = Omit<ReminderInput, "carId">;
type BackendReminderCreateInput = Omit<ReminderCreateInput, "dueDate"> & {
  expiresAt: string;
};
type BackendReminderUpdateInput = Partial<Omit<ReminderInput, "dueDate">> & {
  expiresAt?: string;
};

function toBackendReminderInput(data: ReminderCreateInput): BackendReminderCreateInput {
  const { dueDate, ...rest } = data;
  return {
    ...rest,
    expiresAt: dueDate,
  };
}

function toBackendReminderUpdateInput(data: Partial<ReminderInput>): BackendReminderUpdateInput {
  const { dueDate, ...rest } = data;
  return {
    ...rest,
    ...(dueDate !== undefined ? { expiresAt: dueDate } : {}),
  };
}

function toReminder(data: BackendReminder): Reminder {
  return {
    ...data,
    dueDate: data.dueDate ?? data.expiresAt ?? "",
  };
}

export const remindersApi = {
  listAll: async () => {
    const data = await apiRequest<BackendReminder[]>("/reminders");
    return data.map(toReminder);
  },
  listByCar: async (carId: string) => {
    const data = await apiRequest<BackendReminder[]>(`/reminders/car/${carId}`);
    return data.map(toReminder);
  },
  create: async (carId: string, data: ReminderCreateInput) => {
    const reminder = await apiRequest<BackendReminder>(`/reminders/car/${carId}`, {
      method: "POST",
      body: toBackendReminderInput(data),
    });
    return toReminder(reminder);
  },
  update: async (id: string, data: Partial<ReminderInput>) => {
    const reminder = await apiRequest<BackendReminder>(`/reminders/${id}`, {
      method: "PATCH",
      body: toBackendReminderUpdateInput(data),
    });
    return toReminder(reminder);
  },
  renew: (id: string, body?: { dueDate?: string }) =>
    apiRequest<Reminder>(`/reminders/${id}/renew`, {
      method: "POST",
      body: body?.dueDate ? { expiresAt: body.dueDate } : {},
    }),
  remove: (id: string) => apiRequest<void>(`/reminders/${id}`, { method: "DELETE" }),
};
