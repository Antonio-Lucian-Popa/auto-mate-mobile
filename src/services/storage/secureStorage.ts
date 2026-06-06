import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS = "automate.accessToken";
const REFRESH = "automate.refreshToken";

/** Token-urile sensibile merg in SecureStore (Keychain / Keystore) */
export const tokenStorage = {
  async save(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync(ACCESS, accessToken);
    await SecureStore.setItemAsync(REFRESH, refreshToken);
  },
  async getAccess() {
    return SecureStore.getItemAsync(ACCESS);
  },
  async getRefresh() {
    return SecureStore.getItemAsync(REFRESH);
  },
  async clear() {
    await SecureStore.deleteItemAsync(ACCESS);
    await SecureStore.deleteItemAsync(REFRESH);
  },
};

/** Wrapper generic JSON peste AsyncStorage pentru datele mock locale */
export const jsonStorage = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  },
  async remove(key: string) {
    await AsyncStorage.removeItem(key);
  },
};

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
