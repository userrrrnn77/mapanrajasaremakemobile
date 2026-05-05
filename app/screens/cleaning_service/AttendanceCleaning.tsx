import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { useLokasi } from "../../hooks/useLokasi";
import { useUpload } from "../../hooks/useUpload";
import {
  checkInReq,
  checkOutReq,
  sickAttendanceReq,
  getMyAttendanceReq,
  ShiftType,
} from "../../api/attendance";
import { getAllUserReq } from "../../api/user";
import { getAllLocationsReq } from "../../api/workLocation"; 
import { useAuthStore } from "../../context/useAuthStore";
import {
  Container,
  Header,
  Typography,
  Button,
  Input,
  Card,
  Avatar,
  Divider,
  Toast,
  Dropdown,
} from "../../components/index";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";

interface IUserBackup {
  _id: string;
  name: string;
  role: string;
  photo?: { url: string };
  assignedWorkLocation?: { name: string };
}

export default function AttendanceCleaning({ navigation }: any) {
  const { user } = useAuthStore();
  const { ambilLokasi, lokasi } = useLokasi();
  const { prosesUpload } = useUpload();

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString("id-ID"),
  );

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

  const [shift, setShift] = useState<ShiftType>("pagi");
  const [note, setNote] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isBackup, setIsBackup] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(true);
  const [daftarKaryawan, setDaftarKaryawan] = useState<IUserBackup[]>([]);
  const [karyawanTerpilihId, setKaryawanTerpilihId] = useState<string | number>(
    "",
  );
  const [loadingKaryawan, setLoadingKaryawan] = useState(false);
  const [alamatRealtime, setAlamatRealtime] = useState("Mencari lokasi...");

  // --- LOGIC AUTO SHIFT START ---
  useEffect(() => {
    const autoDetectShift = async () => {
      // Jangan timpa shift kalo kuli udah absen masuk
      if (hasCheckedIn) return;

      try {
        const res = await getAllLocationsReq();
        const locations = res.data;

        // 1. Cari lokasi yang sesuai sama user (filter Code & Role)
        const myLocation = locations.find(
          (loc: any) =>
            loc.code === user?.assignedWorkLocation?.code &&
            loc.role === user?.role,
        );

        if (myLocation) {
          const now = new Date();
          const day = now.getDay();
          const isWeekend = day === 0 || day === 6;
          const config = isWeekend
            ? myLocation.shiftConfigs.weekend
            : myLocation.shiftConfigs.weekday;

          // Convert jam sekarang ke menit biar gampang bandinginnya
          const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

          const shifts: ShiftType[] = ["pagi", "siang", "malam"];
          let detectedShift: ShiftType = "pagi"; // default

          for (const s of shifts) {
            const sTime = config[s];
            if (sTime && sTime.hour !== 0) {
              const startWindow = sTime.hour * 60 + sTime.minute - 10; // 10 menit sebelum
              const endWindow = sTime.hour * 60 + sTime.minute + 10; // 10 menit sesudah

              if (
                currentTotalMinutes >= startWindow &&
                currentTotalMinutes <= endWindow
              ) {
                detectedShift = s;
                break;
              }
            }
          }
          setShift(detectedShift);
        }
      } catch (error) {
        console.log("Gagal deteksi shift otomatis", error);
      }
    };

    autoDetectShift();
  }, [user, hasCheckedIn]);
  // --- LOGIC AUTO SHIFT END ---

  const dropdownOptions = daftarKaryawan.map((k) => ({
    label: k.name,
    value: k._id,
  }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString("id-ID"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      await ambilLokasi();
    })();
  }, []);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await getMyAttendanceReq();
        const data = res.data?.data || res.data;
        const activeAbsen = data.find(
          (a: any) => a.type === "masuk" && !a.checkOut,
        );
        if (activeAbsen) {
          setHasCheckedIn(true);
          setShift(activeAbsen.shift);
        }
      } catch (e) {
        console.log("Gagal cek status absen");
      }
    };
    fetchStatus();
  }, []);

  useEffect(() => {
    if (!hasCheckedIn) return;
    const timer = setInterval(() => {
      const now = new Date();
      const isWeekend = now.getDay() === 0 || now.getDay() === 6;
      let targetH =
        shift === "pagi" ? (isWeekend ? 10 : 12) : isWeekend ? 14 : 16;
      const targetTime = new Date();
      targetTime.setHours(targetH, 0, 0, 0);
      const diff = targetTime.getTime() - now.getTime();
      if (diff <= 0) {
        setIsLocked(false);
        setCountdown(null);
        clearInterval(timer);
      } else {
        setIsLocked(true);
        const h = Math.floor(diff / 3600000)
          .toString()
          .padStart(2, "0");
        const m = Math.floor((diff % 3600000) / 60000)
          .toString()
          .padStart(2, "0");
        const s = Math.floor((diff % 60000) / 1000)
          .toString()
          .padStart(2, "0");
        setCountdown(`${h}:${m}:${s}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [hasCheckedIn, shift]);

  useEffect(() => {
    if (isBackup) fetchKaryawan();
  }, [isBackup]);

  const fetchKaryawan = async () => {
    setLoadingKaryawan(true);
    try {
      const res = await getAllUserReq();
      const rawList = res.data?.data || res.data;
      const filtered = rawList.filter((u: any) => {
        const idLokasiUser = String(
          u.assignedWorkLocation?._id || u.assignedWorkLocation || "",
        );
        const idLokasiGue = String(
          user?.assignedWorkLocation?._id || user?.assignedWorkLocation || "",
        );
        return (
          u.role === user?.role &&
          String(u._id) !== String(user?._id) &&
          idLokasiUser === idLokasiGue
        );
      });
      setDaftarKaryawan(filtered);
    } catch (e) {
      showToast("Gagal ambil data rekan", "error");
    } finally {
      setLoadingKaryawan(false);
    }
  };

  useEffect(() => {
    if (isCameraOpen && lokasi) {
      (async () => {
        try {
          const reverse = await ExpoLocation.reverseGeocodeAsync({
            latitude: lokasi.lat,
            longitude: lokasi.lng,
          });

          if (reverse && reverse.length > 0) {
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

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
      setCapturedImage(photo.uri);
      setIsCameraOpen(false);
      showToast("Foto berhasil diambil, Bre!");
    }
  };

  const handleAbsen = async (type: "in" | "out" | "sick") => {
    if (!capturedImage) return showToast("Foto dulu muka lu, Bre!", "error");
    if (isBackup && !karyawanTerpilihId)
      return showToast("Pilih rekan backup!", "error");

    const loc = await ambilLokasi();
    if (!loc) return;

    setLoadingSubmit(true);
    try {
      const uploadRes = await prosesUpload(capturedImage, "attendance");
      if (!uploadRes) throw new Error("Upload gagal");

      const payload = {
        lat: loc.lat,
        lng: loc.lng,
        photo: { url: uploadRes.url, publicId: uploadRes.publicId },
        note: isBackup ? `[BACKUP] ${note}` : note,
      };

      if (type === "in") {
        await checkInReq({
          ...payload,
          shift,
          backupForUserId: isBackup ? String(karyawanTerpilihId) : undefined,
        });
        setHasCheckedIn(true);
      } else if (type === "out") {
        await checkOutReq({ lat: loc.lat, lng: loc.lng, note });
      } else {
        await sickAttendanceReq({ ...payload, note: note || "Sakit Bre" });
      }

      showToast("Mantap! Absen mendarat aman.");
      setTimeout(() => navigation.goBack(), 1500);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Server lagi pusing!",
        "error",
      );
    } finally {
      setLoadingSubmit(false);
    }
  };

  if (isCameraOpen) {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="front">
          <View className="flex-1 justify-between p-6">
            <View />
            <View>
              <View className="bg-black/50 p-4 rounded-2xl self-start border border-white/20 mb-6">
                <Typography
                  className="text-white font-bold text-[10px] mb-1"
                  numberOfLines={2}>
                  🏠 {alamatRealtime}
                </Typography>
                <Typography className="text-white font-medium text-[9px]">
                  📍 {lokasi?.lat.toFixed(6)}, {lokasi?.lng.toFixed(6)}
                </Typography>
                <Typography className="text-white text-[9px]">
                  🕒 {currentTime}
                </Typography>
                <View className="mt-2 py-1 px-2 bg-primary/30 rounded-lg border border-primary/50">
                  <Typography className="text-primary font-bold text-[10px] text-center">
                    👤 {user?.fullname}
                  </Typography>
                </View>
              </View>
              <View className="flex-row items-center justify-center gap-10">
                <TouchableOpacity
                  onPress={takePicture}
                  className="w-20 h-20 rounded-full border-4 border-primary bg-primary/20 items-center justify-center">
                  <View className="w-16 h-16 rounded-full bg-primary" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIsCameraOpen(false)}
                  className="bg-red-500/20 p-4 rounded-full border border-red-500/50">
                  <MaterialCommunityIcons
                    name="close"
                    size={30}
                    color="#ef4444"
                  />
                </TouchableOpacity>
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
        title="Absensi Cleaning"
        showBack
        onBack={() => navigation.goBack()}
      />
      <ScrollView className="px-4 py-2" showsVerticalScrollIndicator={false}>
        <Card className="p-4 mb-4 bg-card dark:bg-slate-800 border-border">
          <Typography variant="h2" className="text-center mb-1 dark:text-white">
            Selfie Absen
          </Typography>
          <Typography
            variant="caption"
            className="text-center mb-4 dark:text-white">
            Biar admin tau lu beneran kerja rodi, Bre!
          </Typography>
          <View className="items-center justify-center mb-4">
            <Avatar
              name={user?.fullname || "User"}
              uri={capturedImage || undefined}
              size="2xl"
              className="border-2 border-primary"
            />
            <TouchableOpacity
              onPress={() => setIsCameraOpen(true)}
              className="absolute bottom-0 right-1/4 bg-primary p-3 rounded-full border-4 border-background">
              <MaterialCommunityIcons name="camera" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Divider className="my-4" />
          <View className="flex-row gap-2 mb-4">
            {["pagi", "siang", "malam"].map((s) => (
              <TouchableOpacity
                key={s}
                disabled={hasCheckedIn}
                onPress={() => setShift(s as ShiftType)}
                className={`flex-1 p-3 rounded-xl border items-center ${shift === s ? "bg-primary border-primary" : "bg-transparent border-border"} ${hasCheckedIn && shift !== s ? "opacity-30" : ""}`}>
                <Typography
                  className={`capitalize font-bold dark:text-white ${shift === s ? "text-white dark:text-white" : ""}`}>
                  {s}
                </Typography>
              </TouchableOpacity>
            ))}
          </View>
          <Input
            label="Catatan"
            placeholder="Keterangan tambahan (opsional)"
            value={note}
            onChangeText={setNote}
          />
          <View className="mt-4 flex-row items-center">
            <TouchableOpacity
              onPress={() => !hasCheckedIn && setIsBackup(!isBackup)}
              disabled={hasCheckedIn}
              className={`w-6 h-6 rounded border items-center justify-center ${isBackup ? "bg-primary border-primary" : "border-border"} ${hasCheckedIn ? "opacity-30" : ""}`}>
              {isBackup && (
                <MaterialCommunityIcons name="check" size={18} color="white" />
              )}
            </TouchableOpacity>
            <Typography className="ml-3 font-medium dark:text-white">
              Backup Teman?
            </Typography>
          </View>
          {isBackup && (
            <View className="mt-4">
              {loadingKaryawan ? (
                <ActivityIndicator color="#0099ff" />
              ) : (
                <Dropdown
                  label="Pilih Rekan Kerja"
                  options={dropdownOptions}
                  value={karyawanTerpilihId}
                  onSelect={(val) => setKaryawanTerpilihId(val)}
                  placeholder="Cari nama rekan..."
                />
              )}
            </View>
          )}
        </Card>
        <View className="gap-3 mb-10">
          <View className="flex-row gap-3">
            <Button
              title="Check In"
              loading={loadingSubmit}
              disabled={hasCheckedIn}
              className={`flex-1 py-5 rounded-xl ${hasCheckedIn ? "bg-gray-400 border-gray-400" : "bg-primary"}`}
              onPress={() => handleAbsen("in")}
              variant="ghost"
            />
            <Button
              title={isLocked && hasCheckedIn ? (countdown ?? "") : "Check Out"}
              variant="ghost"
              disabled={!hasCheckedIn || (isLocked && !!countdown)}
              className={`flex-1 py-5 rounded-xl ${!hasCheckedIn || (isLocked && !!countdown) ? "bg-gray-400 border-gray-400" : "bg-red-500 border-red-500"}`}
              onPress={() => handleAbsen("out")}
            />
          </View>
          <Button
            title="Izin Sakit"
            variant="outline"
            disabled={hasCheckedIn}
            className={`py-5 rounded-xl ${hasCheckedIn ? "border-gray-400 opacity-50" : "border-yellow-500 bg-yellow-500"}`}
            onPress={() => handleAbsen("sick")}
          />
        </View>
      </ScrollView>
    </Container>
  );
}
