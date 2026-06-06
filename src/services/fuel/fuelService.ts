import { apiRequest } from "@/services/api/client";
import type { FuelLog } from "@/types";

type BackendFuelLog = Omit<FuelLog, "receiptImageUri"> & {
  receiptImageUrl: string | null;
  createdAt: string;
};

type FuelAnalytics = {
  averageConsumption: number | null;
  averagePricePerLiter: number | null;
  monthlyCost: number | null;
  kmBetweenFillups: number | null;
};

function mapLog(l: BackendFuelLog): FuelLog {
  return {
    id: l.id,
    carId: l.carId,
    date: l.date.slice(0, 10),
    station: l.station,
    fuelType: l.fuelType,
    liters: l.liters,
    pricePerLiter: l.pricePerLiter,
    total: l.total,
    mileage: l.mileage,
    fullTank: l.fullTank,
    receiptImageUri: l.receiptImageUrl ?? undefined,
  };
}

export const fuelService = {
  async list(carId?: string): Promise<FuelLog[]> {
    const qs = carId ? `?carId=${carId}` : "";
    const data = await apiRequest<BackendFuelLog[]>(`/fuel${qs}`);
    return data.map(mapLog);
  },

  async create(input: Omit<FuelLog, "id">): Promise<FuelLog> {
    const data = await apiRequest<BackendFuelLog>("/fuel", {
      method: "POST",
      body: input,
    });
    return mapLog(data);
  },

  async remove(id: string): Promise<void> {
    await apiRequest<void>(`/fuel/${id}`, { method: "DELETE" });
  },

  async averageConsumption(carId: string): Promise<number | null> {
    const qs = `?carId=${carId}`;
    const data = await apiRequest<FuelAnalytics>(`/fuel/analytics${qs}`);
    return data.averageConsumption;
  },

  /** Serie L/100km intre alimentari consecutive full-tank (calculat din lista). */
  async consumptionSeries(carId: string): Promise<{ date: string; value: number }[]> {
    const logs = (await this.list(carId))
      .filter((f) => f.mileage && f.fullTank)
      .sort((a, b) => a.date.localeCompare(b.date));
    const out: { date: string; value: number }[] = [];
    for (let i = 1; i < logs.length; i++) {
      const dist = (logs[i].mileage ?? 0) - (logs[i - 1].mileage ?? 0);
      if (dist > 0 && logs[i].liters > 0) {
        out.push({ date: logs[i].date, value: Math.round((logs[i].liters / dist) * 1000) / 10 });
      }
    }
    return out;
  },
};
