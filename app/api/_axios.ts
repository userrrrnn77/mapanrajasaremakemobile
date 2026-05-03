import axios from "axios";
import * as SecureStore from "expo-secure-store"; //
import { Alert } from "react-native";
import { useAuthStore } from "../context/useAuthStore"; //

const api = axios.create({
  baseURL: "http://192.168.1.2:5001/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

api.interceptors.request.use(
  async (config) => {
    // Ambil dari SecureStore, bukan AsyncStorage biar sama kayak Zustand lu
    const token = await SecureStore.getItemAsync("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      // Panggil clearAuth dari Zustand buat bersihin state & SecureStore
      const { clearAuth } = useAuthStore.getState();
      await clearAuth();

      Alert.alert(
        "Sesi Berakhir",
        error.response.data.message || "Silahkan login ulang bre.",
        [{ text: "Oke" }],
      );
    }
    return Promise.reject(error);
  },
);

export default api;
