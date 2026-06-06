import { create } from "zustand";
import { jsonStorage } from "@/services/storage/secureStorage";

const KEY = "automate.settings";

type Settings = {
  theme: "dark" | "light" | "system";
  notificationsEnabled: boolean;
  remindDaysBefore: number;
  devMockReceipts: boolean;
  onboarded: boolean;
};

const DEFAULTS: Settings = { theme: "dark", notificationsEnabled: true, remindDaysBefore: 7, devMockReceipts: false, onboarded: false };

type SettingsStore = Settings & {
  hydrate: () => Promise<void>;
  update: (patch: Partial<Settings>) => void;
};

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULTS,
  hydrate: async () => {
    const s = await jsonStorage.get<Settings>(KEY, DEFAULTS);
    set(s);
  },
  update: (patch) => {
    set(patch as any);
    const { hydrate, update, ...rest } = get();
    jsonStorage.set(KEY, { ...rest, ...patch });
  },
}));
