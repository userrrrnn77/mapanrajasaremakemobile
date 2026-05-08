import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { CameraView } from "expo-camera";
import * as ExpoLocation from "expo-location";
import { useLokasi } from "../../hooks/useLokasi";
import { useUpload } from "../../hooks/useUpload";
import { createReportReq } from "../../api/report";
import { getMyAttendanceReq } from "../../api/attendance";
import { useAuthStore } from "../../context/useAuthStore";
import {
  Container,
  Header,
  Typography,
  Button,
  Input,
  Card,
  Divider,
  Toast,
} from "../../components/index";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ReportCleaning({ navigation }: any) {
  const { user } = useAuthStore();
  const { ambilLokasi, lokasi } = useLokasi();
  const { prosesUpload, isUploading } = useUpload();

  // States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]); // Array URL Cloudinary[cite: 12]
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [alamatRealtime, setAlamatRealtime] = useState("Mencari lokasi...");
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkingAbsen, setCheckingAbsen] = useState(true);

  const cameraRef = useRef<any>(null);
  const [toast, setToast] = useState<{
    msg: string;
    type: "success" | "error" | "info";
    visible: boolean;
  }>({ msg: "", type: "success", visible: false });

  const showToast = (
    msg: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ msg, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  // 1. Satpam Cek Absen (YYYY-MM-DD)[cite: 9]
  useEffect(() => {
    const verifyAttendance = async () => {
      setCheckingAbsen(true);
      try {
        const today = new Date().toISOString().split("T")[0];
        const res = await getMyAttendanceReq({
          startDate: today,
          endDate: today,
        });
        const sudahMasuk = (res.data || []).some(
          (a: any) => a.type === "masuk",
        );

        setHasCheckedInToday(sudahMasuk);
        if (!sudahMasuk) {
          showToast("Absen MASUK dulu, baru bisa bikin laporan!", "error");
        }
      } catch (e) {
        console.log("Gagal verifikasi absen");
      } finally {
        setCheckingAbsen(false);
      }
    };
    verifyAttendance();
  }, []);

  // 2. Geocoding Laporan[cite: 5]
  useEffect(() => {
    if (isCameraOpen && lokasi) {
      (async () => {
        try {
          const reverse = await ExpoLocation.reverseGeocodeAsync({
            latitude: lokasi.lat,
            longitude: lokasi.lng,
          });
          if (reverse.length > 0) {
            const { street, name, district, city } = reverse[0];
            setAlamatRealtime(
              `${street || name || ""}, ${district || ""}, ${city || ""}`,
            );
          }
        } catch (e) {
          setAlamatRealtime("Lokasi tidak terdeteksi");
        }
      })();
    }
  }, [isCameraOpen, lokasi]);

  // 3. Camera Action (Hanya Belakang)
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
        });
        const uploadRes = await prosesUpload(photo.uri, "reports");

        if (uploadRes) {
          setPhotos((prev) => [...prev, uploadRes.url]); // Backend minta array string URL[cite: 11]
          setIsCameraOpen(false);
          showToast("Foto bukti berhasil disimpan!");
        }
      } catch (err) {
        showToast("Gagal ambil gambar", "error");
      }
    }
  };

  // 4. Submit Report
  const handleSubmit = async () => {
    if (!hasCheckedInToday)
      return showToast("Absen dulu baru laporan, Bre!", "error");
    if (!description || description.length < 5)
      return showToast("Kasih deskripsi yang jelas (min 5 huru)!", "error");
    if (photos.length === 0)
      return showToast("Mana foto buktinya? No hoax ya!", "error");

    setLoadingSubmit(true);
    try {
      await createReportReq({
        description,
        address: alamatRealtime,
        lat: lokasi?.lat || 0,
        lng: lokasi?.lng || 0,
        photos,
        source: "mobile",
        priority: "medium",
      });

      showToast("Laporan Savage Berhasil Terkirim!");
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Gagal kirim laporan",
        "error",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (isCameraOpen) {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back">
          <View className="flex-1 justify-between p-8">
            <View />
            <View>
              {/* Box Info Lokasi */}
              <View className="bg-black/70 p-5 rounded-[24px] border border-white/20 mb-10">
                <View className="flex-row items-center mb-1">
                  <MaterialCommunityIcons
                    name="map-marker-radius"
                    size={18}
                    color="#0099ff"
                  />
                  <Typography
                    className="text-white font-bold ml-2 text-xs"
                    numberOfLines={1}>
                    {alamatRealtime}
                  </Typography>
                </View>
                <Typography className="text-white/50 text-[10px]">
                  📍 {lokasi?.lat.toFixed(6)}, {lokasi?.lng.toFixed(6)}
                </Typography>
              </View>

              {/* Shutter Button */}
              <View className="flex-row items-center justify-center gap-16 mb-6">
                <TouchableOpacity onPress={() => setIsCameraOpen(false)}>
                  <MaterialCommunityIcons
                    name="close-circle-outline"
                    size={40}
                    color="white"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={takePicture}
                  disabled={isUploading}
                  className="w-24 h-24 rounded-full border-4 border-white items-center justify-center">
                  {isUploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View className="w-16 h-16 rounded-full bg-white" />
                  )}
                </TouchableOpacity>

                <View className="w-10" />
              </View>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <Container className="bg-background dark:bg-slate-950">
      <Toast message={toast.msg} type={toast.type} visible={toast.visible} />
      <Header
        title="Laporan Cleaning"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView className="px-5 py-4" showsVerticalScrollIndicator={false}>
        <Card className="p-6 mb-8 bg-card dark:bg-slate-900 border-border rounded-[32px] shadow-2xl">
          <Typography
            variant="h2"
            className="mb-2 dark:text-white font-black text-primary">
            Ada Temuan Apa, Bre?
          </Typography>
          <Typography className="text-gray-500 mb-6 text-xs">
            Laporkan fasilitas kotor atau rusak biar langsung ditindak!
          </Typography>

          <Input
            label="Deskripsi Masalah"
            placeholder="Contoh: Ada kebocoran pipa di toilet lantai 3..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="mb-8"
          />

          <Typography variant="h3" className="mb-4 dark:text-white font-bold">
            Bukti Foto Laporan
          </Typography>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row mb-6 py-3">
            {photos.map((url, index) => (
              <View key={index} className="mr-4 shadow-xl">
                <Image
                  source={{ uri: url }}
                  className="w-40 h-56 rounded-[24px]"
                />
                <TouchableOpacity
                  onPress={() =>
                    setPhotos((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="absolute -top-2 -right-2 bg-red-600 rounded-full p-2 border-2 border-white">
                  <MaterialCommunityIcons
                    name="trash-can"
                    size={18}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            ))}

            {photos.length < 5 && (
              <TouchableOpacity
                onPress={() => {
                  ambilLokasi();
                  setIsCameraOpen(true);
                }}
                className="w-40 h-56 rounded-[24px] border-2 border-dashed border-primary items-center justify-center bg-primary/10">
                <View className="bg-primary p-4 rounded-full shadow-lg">
                  <MaterialCommunityIcons
                    name="camera"
                    size={32}
                    color="white"
                  />
                </View>
                <Typography className="text-primary font-black mt-3">
                  Ambil Foto
                </Typography>
              </TouchableOpacity>
            )}
          </ScrollView>

          <Divider className="my-2" />
          <View className="flex-row items-center p-3">
            <MaterialCommunityIcons
              name="shield-check"
              size={20}
              color="#0099ff"
            />
            <Typography className="text-gray-500 text-[10px] ml-2 flex-1">
              Laporan lu bakal masuk ke sistem Admin
            </Typography>
          </View>
        </Card>

        <Button
          title={
            hasCheckedInToday
              ? "KIRIM LAPORAN SEKARANG 🔥"
              : "ABSEN DULU BARU LAPOR 🔒"
          }
          loading={loadingSubmit || checkingAbsen}
          disabled={!hasCheckedInToday}
          onPress={handleSubmit}
          className={`rounded-2xl py-6 shadow-2xl mb-12 ${hasCheckedInToday ? "bg-primary" : "bg-gray-500 opacity-50"}`}
        />
      </ScrollView>
    </Container>
  );
}
