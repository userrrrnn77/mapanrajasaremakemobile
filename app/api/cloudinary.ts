import axios from "axios";
import api from "./_axios";

interface SignatureResponse {
  success: boolean;
  data: {
    timestamp: number;
    signature: string;
    apiKey: string;
    cloudName: string;
    folder: string;
  };
}

export const uploadToCloudinary = async (
  fileUri: string,
  folder: "avatars" | "activities" | "attendance" | "reports",
) => {
  try {
    // 1. Ambil Signature dari Backend
    // Axios response itu datanya ada di properti .data
    const response = await api.get<SignatureResponse>(
      `/cloudinary/signature?folder=${folder}`,
    );
    const sig = response.data.data;

    // 2. Siapin FormData
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      type: "image/jpeg",
      name: `upload_${Date.now()}.jpg`,
    } as any);

    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", sig.timestamp.toString());
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);

    // 3. Tembak Langsung ke Cloudinary
    const cloudUrl = `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`;
    const resCloud = await axios.post(cloudUrl, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return {
      url: resCloud.data.secure_url,
      publicId: resCloud.data.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error; // Lempar biar ditangkep Alert di Hook
  }
};
