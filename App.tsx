import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppNavigator } from "./app/navigation/AppNavigator";
import { useColorScheme } from "nativewind";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";

// 🔥 WAJIB: Import file css global biar NativeWind jalan Bre!
// @ts-ignore
import "./global.css";
import { useAuthStore } from "./app/context/useAuthStore";

export default function App() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { hydrate, hydrated } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) return null;

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <AppNavigator />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
