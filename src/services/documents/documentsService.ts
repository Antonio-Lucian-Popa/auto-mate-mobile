/**
 * documentsService.ts — Serviciu MOCK local (AsyncStorage). Vezi BACKEND_EXTENSIONS_NEEDED.md.
 */
import { jsonStorage, uid } from "@/services/storage/secureStorage";
import type { CarDocument } from "@/types";

const KEY = "automate.documents";

export const documentsService = {
  async list(carId?: string): Promise<CarDocument[]> {
    const all = await jsonStorage.get<CarDocument[]>(KEY, []);
    const filtered = carId ? all.filter((d) => d.carId === carId) : all;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async create(input: Omit<CarDocument, "id" | "createdAt">): Promise<CarDocument> {
    const all = await jsonStorage.get<CarDocument[]>(KEY, []);
    const doc: CarDocument = { ...input, id: uid(), createdAt: new Date().toISOString() };
    await jsonStorage.set(KEY, [doc, ...all]);
    return doc;
  },
  async remove(id: string): Promise<void> {
    const all = await jsonStorage.get<CarDocument[]>(KEY, []);
    await jsonStorage.set(KEY, all.filter((d) => d.id !== id));
  },
};
