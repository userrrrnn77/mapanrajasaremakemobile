import * as Linking from "expo-linking";
import Constants from "expo-constants";
import { Alert, Platform } from "react-native";
import api from "../api/_axios"; // Import api huruf kecil dari _axios

interface VersionResponse {
  success: boolean;
  latestVersion: string;
  downloadUrl: string;
  forceUpdate: boolean;
  notes: string;
}

/**
 * 🔥 CHECKER UPDATE APLIKASI
 * Bandingin versi app sekarang sama yang ada di server
 */
export const checkUpdate = async (): Promise<void> => {
  try {
    // 1. Ambil versi dari expo config
    const currentVersion = Constants.expoConfig?.version || "1.0.0";

    // 2. Tembak API (sesuaikan platform secara otomatis)
    const platform = Platform.OS === "android" ? "android" : "ios";
    const response = await api.get<VersionResponse>(
      `/version?platform=${platform}`,
    );

    const data = response.data;

    if (data.success) {
      const { latestVersion, downloadUrl, forceUpdate } = data;

      // 3. Logic perbandingan simpel
      if (currentVersion !== latestVersion) {
        Alert.alert(
          "Update Aplikasi 🚀",
          `Versi ${latestVersion} sudah tersedia! Silahkan update untuk mendapatkan fitur terbaru.`,
          [
            {
              text: forceUpdate ? "Wajib Update" : "Nanti Saja",
              style: forceUpdate ? "default" : "cancel",
              onPress: () => {
                // Kalau wajib update, kita munculin lagi alert-nya biar user gak bisa kabur
                if (forceUpdate) checkUpdate();
              },
            },
            {
              text: "Download Sekarang",
              onPress: () => {
                if (downloadUrl) {
                  Linking.openURL(downloadUrl);
                } else {
                  Alert.alert("Info", "Link download belum tersedia, Bre.");
                }
              },
            },
          ],
          { cancelable: !forceUpdate },
        );
      }
    }
  } catch (error: any) {
    // Gak perlu alert ke user kalau cuma error checker (opsional)
    console.error("Update Check Error:", error.message);
  }
};
