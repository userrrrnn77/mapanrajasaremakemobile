import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrated: boolean; // ← tambah ini
  setAuth: (user: any, token: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  hydrate: () => Promise<void>; // ← tambah ini
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrated: false,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync("userToken", token);
    await SecureStore.setItemAsync("userData", JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync("userToken");
    await SecureStore.deleteItemAsync("userData");
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync("userToken");
      const userData = await SecureStore.getItemAsync("userData");
      if (token && userData) {
        set({
          token,
          user: JSON.parse(userData),
          isAuthenticated: true,
        });
      }
    } catch (e) {
      console.log("Hydration error:", e);
    } finally {
      set({ hydrated: true });
    }
  },
}));
