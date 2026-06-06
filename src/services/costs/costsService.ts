/**
 * costsService.ts
 * Serviciu MOCK local (AsyncStorage) — backend-ul nu suporta inca /costs.
 * Vezi BACKEND_EXTENSIONS_NEEDED.md. Inlocuieste cu apiRequest cand e gata.
 */
import { jsonStorage, uid } from "@/services/storage/secureStorage";
import type { Cost } from "@/types";

const KEY = "automate.costs";

export const costsService = {
  async list(carId?: string): Promise<Cost[]> {
    const all = await jsonStorage.get<Cost[]>(KEY, []);
    const filtered = carId ? all.filter((c) => c.carId === carId) : all;
    return filtered.sort((a, b) => b.date.localeCompare(a.date));
  },
  async create(input: Omit<Cost, "id">): Promise<Cost> {
    const all = await jsonStorage.get<Cost[]>(KEY, []);
    const cost: Cost = { ...input, id: uid() };
    await jsonStorage.set(KEY, [cost, ...all]);
    return cost;
  },
  async remove(id: string): Promise<void> {
    const all = await jsonStorage.get<Cost[]>(KEY, []);
    await jsonStorage.set(KEY, all.filter((c) => c.id !== id));
  },
  async monthlyTotal(carId: string, month = new Date()): Promise<number> {
    const all = await this.list(carId);
    const ym = month.toISOString().slice(0, 7);
    return all.filter((c) => c.date.startsWith(ym)).reduce((s, c) => s + c.amount, 0);
  },
};
