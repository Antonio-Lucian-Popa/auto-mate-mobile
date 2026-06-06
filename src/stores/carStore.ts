import { create } from "zustand";
import { jsonStorage } from "@/services/storage/secureStorage";

const KEY = "automate.selectedCarId";

type CarStore = {
  selectedCarId: string | null;
  setSelectedCar: (id: string | null) => void;
  loadSelected: () => Promise<void>;
};

export const useCarStore = create<CarStore>((set) => ({
  selectedCarId: null,
  setSelectedCar: (id) => {
    set({ selectedCarId: id });
    if (id) jsonStorage.set(KEY, id);
  },
  loadSelected: async () => {
    const id = await jsonStorage.get<string | null>(KEY, null);
    set({ selectedCarId: id });
  },
}));
