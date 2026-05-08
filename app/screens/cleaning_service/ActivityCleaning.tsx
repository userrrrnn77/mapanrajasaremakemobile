import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from "react-native";
import { CameraView } from "expo-camera";
import * as ExpoLocation from "expo-location";
import { useLokasi } from "../../hooks/useLokasi";
import { useUpload } from "../../hooks/useUpload";
import { createActivityReq } from "../../api/activity";
import { useAuthStore } from "../../context/useAuthStore";
import { useThemeStore } from "../../context/useThemeStore";
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
import { getMyAttendanceReq } from "../../api/attendance";

const { width } = Dimensions.get("window");

export default function ActivityCleaning({ navigation }: any) {
  const { user } = useAuthStore();
  const { theme } = useThemeStore();
  const { ambilLokasi, lokasi } = useLokasi();
  const { prosesUpload, isUploading } = useUpload();

  // Camera & Logic States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [facing, setFacing] = useState<"front" | "back">("back");
  const [timer, setTimer] = useState<number>(0);
  const [isCounting, setIsCounting] = useState(false);
  const [countdownNum, setCountdownNum] = useState<number>(0);

  // cek absensi
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkingAbsen, setCheckingAbsen] = useState(true);

  // Form States
  const [title, setTitle] = useState("");
  const [documentation, setDocumentation] = useState<any[]>([]);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [alamatRealtime, setAlamatRealtime] = useState("Mencari lokasi...");
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("id-ID"),
  );

  // Fungsi buat bikin DayKey (YYYY-MM-DD)
  const getTodayKey = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

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

  // 1. Watermark & Clock
  useEffect(() => {
    const clock = setInterval(
      () => setCurrentTime(new Date().toLocaleTimeString("id-ID")),
      1000,
    );
    return () => clearInterval(clock);
  }, []);

  // 2. Reverse Geocoding
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
          setAlamatRealtime("Lokasi tidak terbaca");
        }
      })();
    }
  }, [isCameraOpen, lokasi]);

  useEffect(() => {
    const checkAttendance = async () => {
      setCheckingAbsen(true);
      try {
        const today = getTodayKey();
        // Tembak API riwayat absen lu pake range hari ini
        const res = await getMyAttendanceReq({
          startDate: today,
          endDate: today,
        });

        // Cek apakah ada data absen yang tipenya 'masuk' hari ini
        const data = res.data || [];
        const sudahMasuk = data.some((a: any) => a.type === "masuk");

        setHasCheckedInToday(sudahMasuk);
        if (!sudahMasuk) {
          showToast(
            "Woi Bre! Absen MASUK dulu baru bisa setor kegiatan!",
            "error",
          );
        }
      } catch (e) {
        console.log("Gagal cek status absen", e);
      } finally {
        setCheckingAbsen(false);
      }
    };

    checkAttendance();
  }, []);

  // 3. Timer & Capture Logic
  const startCapture = () => {
    if (timer > 0) {
      setIsCounting(true);
      setCountdownNum(timer);
      let count = timer;
      const interval = setInterval(() => {
        count -= 1;
        setCountdownNum(count);
        if (count === 0) {
          clearInterval(interval);
          setIsCounting(false);
          takePicture();
        }
      }, 1000);
    } else {
      takePicture();
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.5,
        });
        const uploadRes = await prosesUpload(photo.uri, "activities");

        if (uploadRes) {
          setDocumentation((prev) => [
            ...prev,
            {
              photo: { url: uploadRes.url, publicId: uploadRes.publicId },
              caption: `Kegiatan di ${alamatRealtime}`,
            },
          ]);
          setIsCameraOpen(false);
          setTimer(0);
          showToast("Foto berhasil ditambah!");
        }
      } catch (err) {
        showToast("Gagal ambil foto", "error");
      }
    }
  };

  // 4. Submit to Backend
  const handleSubmit = async () => {
    if (!hasCheckedInToday) {
      return showToast("Jangan curang Bre, absen dulu!", "error");
    }
    if (!title) return showToast("Judul kegiatan wajib diisi, Bre!", "error");
    if (documentation.length === 0)
      return showToast("Minimal 1 foto dokumentasi!", "error");

    setLoadingSubmit(true);
    try {
      await createActivityReq({
        title,
        lat: String(lokasi?.lat),
        lng: String(lokasi?.lng),
        address: alamatRealtime,
        documentation,
      });

      showToast("Kegiatan Savage Berhasil Disimpan!");
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      showToast(error.response?.data?.error || "Gagal simpan", "error");
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (isCameraOpen) {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing={facing}>
          <View className="flex-1 bg-black/20 p-6 justify-between">
            {/* Top Bar */}
            <View className="flex-row justify-between items-center mt-10">
              <TouchableOpacity
                onPress={() =>
                  setFacing((prev) => (prev === "back" ? "front" : "back"))
                }
                className="bg-white/20 p-3 rounded-full border border-white/30">
                <MaterialCommunityIcons
                  name="camera-flip"
                  size={28}
                  color="white"
                />
              </TouchableOpacity>

              <View className="flex-row bg-black/40 rounded-full p-1 border border-white/20">
                {[0, 3, 5, 10].map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setTimer(t)}
                    className={`px-4 py-2 rounded-full ${timer === t ? "bg-primary" : ""}`}>
                    <Typography className="text-white font-bold text-xs">
                      {t === 0 ? "Off" : `${t}s`}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Countdown Overlay */}
            {isCounting && (
              <View className="absolute inset-0 items-center justify-center">
                <Typography className="text-white text-9xl font-black">
                  {countdownNum}
                </Typography>
              </View>
            )}

            {/* Bottom Section */}
            <View>
              <View className="bg-black/60 p-4 rounded-3xl border border-white/10 mb-8">
                <View className="flex-row items-center mb-2">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color="#0099ff"
                  />
                  <Typography
                    className="text-white font-bold text-xs ml-1"
                    numberOfLines={1}>
                    {alamatRealtime}
                  </Typography>
                </View>
                <Typography className="text-white/60 text-[10px]">
                  📍 {lokasi?.lat.toFixed(6)}, {lokasi?.lng.toFixed(6)} | 🕒{" "}
                  {currentTime}
                </Typography>
              </View>

              <View className="flex-row items-center justify-evenly mb-10">
                <TouchableOpacity
                  onPress={() => setIsCameraOpen(false)}
                  className="p-4">
                  <MaterialCommunityIcons
                    name="close"
                    size={32}
                    color="white"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={startCapture}
                  disabled={isUploading || isCounting}
                  className="w-24 h-24 rounded-full border-8 border-white/30 items-center justify-center">
                  <View
                    className={`w-16 h-16 rounded-full bg-white ${isCounting ? "opacity-50" : ""}`}
                  />
                </TouchableOpacity>

                <View className="w-12" />
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
        title="Activity Cleaning"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView className="px-4 py-4" showsVerticalScrollIndicator={false}>
        <Card className="p-5 mb-6 bg-card dark:bg-slate-900 border-border rounded-[32px] shadow-xl">
          <Typography variant="h2" className="mb-6 dark:text-white font-black">
            Lagi ngerjain apa, Bre?
          </Typography>

          <Input
            label="Judul Kegiatan"
            placeholder="Misal: Bersihin Kaca Dekanat"
            value={title}
            onChangeText={setTitle}
            className="mb-6"
          />

          <Typography variant="h3" className="mb-4 dark:text-white font-bold">
            Dokumentasi{" "}
            <Typography className="text-primary">
              ({documentation.length}/10)
            </Typography>
          </Typography>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row mb-6 py-3">
            {documentation.map((item, index) => (
              <View key={index} className="mr-4 shadow-lg ">
                <Image
                  source={{ uri: item.photo.url }}
                  className="w-32 h-44 rounded-3xl"
                />
                <TouchableOpacity
                  onPress={() =>
                    setDocumentation((prev) =>
                      prev.filter((_, i) => i !== index),
                    )
                  }
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2 border-2 border-white">
                  <MaterialCommunityIcons
                    name="delete"
                    size={16}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            ))}

            {documentation.length < 10 && (
              <TouchableOpacity
                onPress={() => {
                  ambilLokasi();
                  setIsCameraOpen(true);
                }}
                className="w-32 h-44 rounded-3xl border-2 border-dashed border-primary items-center justify-center bg-primary/5">
                <View className="bg-primary p-4 rounded-full">
                  <MaterialCommunityIcons name="plus" size={32} color="white" />
                </View>
                <Typography className="text-primary font-bold mt-2 text-xs">
                  Tambah Foto
                </Typography>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View className="bg-primary/10 p-4 rounded-2xl flex-row items-center border border-primary/20">
            <MaterialCommunityIcons
              name="information"
              size={20}
              color="#0099ff"
            />
            <Typography className="text-primary text-[11px] ml-2 flex-1 font-medium">
              Foto bukti kerja bakal otomatis ada lokasi & jamnya ya Bre!
            </Typography>
          </View>
        </Card>

        <Button
          title={hasCheckedInToday ? "KIRIM KEGIATAN 🔥" : "ABSEN DULU BRE 🔒"}
          loading={loadingSubmit || checkingAbsen}
          disabled={!hasCheckedInToday}
          onPress={handleSubmit}
          className={`rounded-2xl py-6 shadow-2xl mb-12 ${
            hasCheckedInToday
              ? "shadow-primary/40 bg-primary"
              : "bg-gray-500 shadow-none"
          }`}
        />
      </ScrollView>
    </Container>
  );
}
