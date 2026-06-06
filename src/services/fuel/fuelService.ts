/**
 * fuelService.ts — Serviciu MOCK local (AsyncStorage). Vezi BACKEND_EXTENSIONS_NEEDED.md.
 */
import { jsonStorage, uid } from "@/services/storage/secureStorage";
import type { FuelLog } from "@/types";

const KEY = "automate.fuel";

export const fuelService = {
  async list(carId?: string): Promise<FuelLog[]> {
    const all = await jsonStorage.get<FuelLog[]>(KEY, []);
    const filtered = carId ? all.filter((f) => f.carId === carId) : all;
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  },
  async create(input: Omit<FuelLog, "id">): Promise<FuelLog> {
    const all = await jsonStorage.get<FuelLog[]>(KEY, []);
    const log: FuelLog = { ...input, id: uid() };
    await jsonStorage.set(KEY, [log, ...all]);
    return log;
  },
  async remove(id: string): Promise<void> {
    const all = await jsonStorage.get<FuelLog[]>(KEY, []);
    await jsonStorage.set(KEY, all.filter((f) => f.id !== id));
  },
  /** Consum mediu L/100km calculat intre alimentari full-tank consecutive */
  async averageConsumption(carId: string): Promise<number | null> {
    const logs = (await this.list(carId)).filter((f) => f.mileage && f.fullTank).sort((a, b) => a.date.localeCompare(b.date));
    if (logs.length < 2) return null;
    let liters = 0;
    let km = 0;
    for (let i = 1; i < logs.length; i++) {
      const dist = (logs[i].mileage ?? 0) - (logs[i - 1].mileage ?? 0);
      if (dist > 0) {
        km += dist;
        liters += logs[i].liters;
      }
    }
    return km > 0 ? Math.round((liters / km) * 1000) / 10 : null;
  },

  /** Serie de consum L/100km intre alimentari consecutive full-tank (pt. grafic) */
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
