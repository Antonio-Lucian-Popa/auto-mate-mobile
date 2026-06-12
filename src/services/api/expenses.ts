import { apiRequest, apiUpload } from "./client";
import type { Expense, ExpenseCategory } from "@/types";

export type ExpenseInput = {
  tripId?: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  merchant?: string;
  merchantCif?: string;
  notes?: string;
  imageUrl?: string;
  verified?: boolean;
};

export type ExpenseFilters = {
  tripId?: string;
  userId?: string;
  category?: ExpenseCategory;
  from?: string;
  to?: string;
};

export const expensesApi = {
  list: (filters?: ExpenseFilters) => {
    const params = new URLSearchParams();
    if (filters?.tripId) params.set("tripId", filters.tripId);
    if (filters?.userId) params.set("userId", filters.userId);
    if (filters?.category) params.set("category", filters.category);
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    const qs = params.toString();
    return apiRequest<Expense[]>(`/expenses${qs ? `?${qs}` : ""}`);
  },

  get: (id: string) => apiRequest<Expense>(`/expenses/${id}`),

  create: (data: ExpenseInput) =>
    apiRequest<Expense>("/expenses", { method: "POST", body: data }),

  update: (id: string, data: Partial<ExpenseInput>) =>
    apiRequest<Expense>(`/expenses/${id}`, { method: "PATCH", body: data }),

  remove: (id: string) => apiRequest<void>(`/expenses/${id}`, { method: "DELETE" }),

  upload: (uri: string, mimeType = "image/jpeg"): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    const fileName = uri.split("/").pop() ?? "receipt.jpg";
    (formData as any).append("file", { uri, name: fileName, type: mimeType });
    return apiUpload<{ imageUrl: string }>("/expenses/upload", formData);
  },

  exportCsvUrl: (filters?: { from?: string; to?: string; userId?: string }): string => {
    const params = new URLSearchParams({ format: "csv" });
    if (filters?.from) params.set("from", filters.from);
    if (filters?.to) params.set("to", filters.to);
    if (filters?.userId) params.set("userId", filters.userId);
    return `/expenses/export?${params.toString()}`;
  },
};
