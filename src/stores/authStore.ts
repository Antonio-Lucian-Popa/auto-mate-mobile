import { create } from "zustand";
import { authApi } from "@/services/api/auth";
import { tokenStorage } from "@/services/storage/secureStorage";
import { setUnauthorizedHandler } from "@/services/api/client";
import type { User } from "@/types";

type AuthState = {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, companyName?: string) => Promise<void>;
  continueAsGuest: () => void;
  logout: () => Promise<void>;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  error: null,

  bootstrap: async () => {
    setUnauthorizedHandler(() => set({ user: null, status: "unauthenticated" }));
    const token = await tokenStorage.getAccess();
    if (!token) {
      set({ status: "unauthenticated" });
      return;
    }
    try {
      const user = await authApi.me();
      set({ user: user ?? null, status: "authenticated" });
    } catch {
      set({ status: "authenticated" });
    }
  },

  login: async (email, password) => {
    set({ status: "loading", error: null });
    try {
      const res = await authApi.login(email, password);
      await tokenStorage.save(res.accessToken, res.refreshToken);
      set({ user: res.user ?? { id: "me", email }, status: "authenticated" });
    } catch (e: any) {
      set({ status: "unauthenticated", error: e.message ?? "Autentificare eșuată." });
      throw e;
    }
  },

  register: async (email, password, name, companyName) => {
    set({ status: "loading", error: null });
    try {
      const res = await authApi.register(email, password, name, companyName);
      await tokenStorage.save(res.accessToken, res.refreshToken);
      set({ user: res.user ?? { id: "me", email, name }, status: "authenticated" });
    } catch (e: any) {
      set({ status: "unauthenticated", error: e.message ?? "Înregistrare eșuată." });
      throw e;
    }
  },

  continueAsGuest: () => {
    set({
      user: { id: "guest", email: "guest@automate.local", name: "Guest" },
      status: "authenticated",
      error: null,
    });
  },

  logout: async () => {
    const refresh = await tokenStorage.getRefresh();
    try {
      if (refresh) await authApi.logout(refresh);
    } catch {}
    await tokenStorage.clear();
    set({ user: null, status: "unauthenticated" });
  },

  clearError: () => set({ error: null }),
}));
