import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "nativewind";

interface ThemeState {
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "system",
  setTheme: async (theme) => {
    await AsyncStorage.setItem("app-theme", theme);
    set({ theme });
  },
}));
