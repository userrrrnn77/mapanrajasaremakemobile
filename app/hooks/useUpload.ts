import { useState } from "react";
import { Alert } from "react-native";
import { uploadToCloudinary } from "../api/cloudinary";

interface UploadResult {
  url: string;
  publicId: string;
}

export const useUpload = () => {
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const prosesUpload = async (
    uri: string,
    folder: "avatars" | "reports" | "attendance" | "activities",
  ): Promise<UploadResult | null> => {
    setIsUploading(true);
    try {
      // Langsung panggil service-nya, kirim 2 argumen: URI dan FOLDER
      const result = await uploadToCloudinary(uri, folder);

      return result; // Isinya { url, publicId }
    } catch (error: any) {
      Alert.alert(
        "Upload Gagal",
        error.message || "Gagal upload foto ke awan, Bre!",
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { prosesUpload, isUploading };
};
