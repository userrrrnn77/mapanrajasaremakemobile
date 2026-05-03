import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const useKamera = () => {
  const [image, setImage] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState<boolean>(false);

  // 1. Galeri
  const bukaGaleri = async (
    allowEditing: boolean = true,
  ): Promise<string | null> => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Izin Diperlukan",
          "Buka pengaturan dan izinkan akses galeri, Bre!",
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: allowEditing,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImage(uri);
        return uri;
      }
      return null;
    } catch (error) {
      Alert.alert("Error", "Gagal buka galeri");
      return null;
    }
  };

  // 2. Kamera Standar
  const bukaKameraStandar = async (
    allowEditing: boolean = true,
  ): Promise<string | null> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Izin Diperlukan", "Butuh akses kamera nih!");
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: allowEditing,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        setImage(uri);
        return uri;
      }
      return null;
    } catch (error) {
      Alert.alert("Error", "Gagal buka kamera");
      return null;
    }
  };

  const resetKamera = () => {
    setImage(null);
    setShowScanner(false);
  };

  return {
    image,
    setImage,
    showScanner,
    setShowScanner,
    bukaGaleri,
    bukaKameraStandar,
    resetKamera,
  };
};
