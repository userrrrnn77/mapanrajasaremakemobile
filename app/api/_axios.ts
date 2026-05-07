import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Alert } from "react-native";
import { useAuthStore } from "../context/useAuthStore";

const api = axios.create({
  baseURL: "https://mapanrajasaremakecore.vercel.app/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// 1. Request Interceptor: Pasang Token Otomatis
api.interceptors.request.use(
  async (config) => {
    // Ambil token langsung dari SecureStore
    const token = await SecureStore.getItemAsync("userToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 2. Response Interceptor: Satpam Token (Anti Tendang Sembarangan)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || "";

    // Hanya urus error 401 (Unauthorized) atau 403 (Forbidden)
    if (status === 401 || status === 403) {
      // Filter logic: Kalo error soal jarak/lokasi, JANGAN logout
      const isLogicError =
        message.toLowerCase().includes("lokasi") ||
        message.toLowerCase().includes("radius") ||
        message.toLowerCase().includes("jarak");

      if (!isLogicError) {
        // Beneran Token abis/invalid, baru tendang ke Login
        const { clearAuth } = useAuthStore.getState();
        await clearAuth();

        Alert.alert(
          "Sesi Berakhir",
          "Sesi lu abis atau akun lu login di tempat lain, Bre. Login lagi ya!",
          [{ text: "Oke" }],
        );
      }
    }

    // Balikin error biar bisa di-handle .catch() di AttendanceCleaning lu
    return Promise.reject(error);
  },
);

// INI YANG PENTING: Jangan ampe ketinggalan export-nya!
export default api;
