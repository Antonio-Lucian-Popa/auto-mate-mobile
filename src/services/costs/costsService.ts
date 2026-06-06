import { apiRequest } from "@/services/api/client";
import type { Cost } from "@/types";

type BackendCost = Omit<Cost, "receiptImageUri"> & {
  receiptImageUrl: string | null;
  createdAt: string;
};

function mapCost(c: BackendCost): Cost {
  return {
    id: c.id,
    carId: c.carId,
    category: c.category,
    amount: c.amount,
    currency: c.currency,
    date: c.date.slice(0, 10),
    mileage: c.mileage,
    vendor: c.vendor,
    notes: c.notes,
    receiptImageUri: c.receiptImageUrl ?? undefined,
  };
}

export const costsService = {
  async list(carId?: string): Promise<Cost[]> {
    const qs = carId ? `?carId=${carId}` : "";
    const data = await apiRequest<BackendCost[]>(`/costs${qs}`);
    return data.map(mapCost);
  },

  async create(input: Omit<Cost, "id">): Promise<Cost> {
    const data = await apiRequest<BackendCost>("/costs", {
      method: "POST",
      body: input,
    });
    return mapCost(data);
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/costs/${id}`, { method: "DELETE" });
  },

  async monthlyTotal(carId: string, month = new Date()): Promise<number> {
    const ym = month.toISOString().slice(0, 7);
    const data = await apiRequest<{ total: number }>(
      `/costs/summary?carId=${carId}&month=${ym}`
    );
    return data.total;
  },
};
