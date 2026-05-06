import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Container, Typography, Header, Avatar, Toast } from "../../components";
import { useAuthStore } from "../../context/useAuthStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getDashboardStatsReq } from "../../api/user"; // Controller lu yang tadi bre
import { useColorScheme } from "nativewind";

export const DashboardCleaning = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const [stats, setStats] = useState({
    totalAktivitas: 0,
    laporanAktif: 0,
    statusAbsen: "Belum Absen",
    currentAttendance: null as any,
  });

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ ...toast, visible: false }), 3000); // Auto hide 3 detik
  };

  const quotesKuli = [
    "Sapu hari ini dengan ikhlas, biar kotoran masa lalu ikut terhempas. ✨",
    "Gajian boleh molor, tapi semangat jangan kendor. Ingat cicilan di luar monitor! 💸",
    "Area bersih, hati tenang, bos senang (walau bonus cuma bayang-bayang). 🧤",
    "Bekerjalah seperti robot, mengeluhlah seperti manusia, gajianlah seperti keajaiban. 🤖",
    "Lantai yang kinclong adalah cermin masa depan yang cerah, Bre! 🌟",
    "Jangan bandingkan gajimu dengan bosmu, bandingkan sabarmu dengan batu karang. 💪",
  ];

  const fetchStats = async () => {
    try {
      const res = await getDashboardStatsReq(); //
      if (res.data.success) {
        const { totalAktivitas, laporanAktif, currentAttendance } =
          res.data.data; //

        // 🔥 Logic Sinkronisasi sama Model Attendance lu
        let statusLabel = "Belum Absen";
        if (currentAttendance) {
          if (
            currentAttendance.type === "masuk" &&
            currentAttendance.isIncomplete
          ) {
            statusLabel = "Sedang Kerja";
          } else if (
            currentAttendance.type === "keluar" ||
            !currentAttendance.isIncomplete
          ) {
            statusLabel = "Sudah Pulang";
          } else if (currentAttendance.type === "sakit") {
            statusLabel = "Izin Sakit";
          }
        }

        setStats({
          totalAktivitas,
          laporanAktif,
          statusAbsen: statusLabel,
          currentAttendance,
        });
      }
    } catch (error: any) {
      console.error("Gagal sinkron data:", error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleBukaForm = () => {
    const statusKunci = ["Sudah Pulang", "Izin Sakit", "Izin"];

    if (statusKunci.includes(stats.statusAbsen)) {
      // Pake Toast Bre, biar makin legit!
      showToast("Shift hari ini udah kelar, selamat istirahat!", "info");
      return;
    }

    navigation.navigate("FormAbsen", {
      statusSekarang: stats.statusAbsen,
      attendanceData: stats.currentAttendance,
    });
  };

  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Container className="px-0 bg-slate-50 dark:bg-slate-900">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />
      <Header
        title="Squad Dashboard"
        rightElement={
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <Avatar
              uri={user?.profilePhoto?.url}
              size="sm"
              name={user?.username}
              className="border-2 border-primary"
            />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Welcome Section */}
        <View className="mb-6">
          <Typography
            variant="h1"
            className="text-3xl text-slate-900 dark:text-white">
            Halo, {user?.username?.split(" ")[0]}! 🧤
          </Typography>
          <Typography className="text-slate-500 mt-1">
            {stats.statusAbsen === "Sedang Kerja"
              ? `Semangat shift ${stats.currentAttendance?.shift || "pagi"} nya!`
              : "Jangan lupa absen sebelum kerja, Bre!"}
          </Typography>
        </View>

        {/* Dynamic Status Card */}
        <View className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 mb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Typography
                variant="caption"
                className="font-bold text-slate-400 uppercase tracking-tighter">
                STATUS ABSENSI
              </Typography>
              <Typography
                variant="h2"
                className={`mt-1 ${
                  stats.statusAbsen === "Sedang Kerja"
                    ? "text-green-500"
                    : stats.statusAbsen === "Sudah Pulang"
                      ? "text-blue-500"
                      : "text-red-500"
                }`}>
                {stats.statusAbsen}
              </Typography>
            </View>
            <TouchableOpacity
              onPress={handleBukaForm}
              disabled={stats.statusAbsen === "Sudah Pulang"}
              className={`px-6 py-3 rounded-2xl ${
                stats.statusAbsen === "Sedang Kerja"
                  ? "bg-red-500"
                  : "bg-primary"
              } ${stats.statusAbsen === "Sudah Pulang" ? "opacity-30" : ""}`}>
              <Typography className="text-white font-bold">
                {stats.statusAbsen === "Sedang Kerja" ? "Check Out" : "Absen"}
              </Typography>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bento Grid Stats*/}
        <View className="flex-row justify-between mb-8">
          <StatBox
            label="Aktivitas"
            value={stats.totalAktivitas}
            icon="camera-outline"
            color="#3b82f6"
            bg="bg-blue-50 dark:bg-blue-500/10"
          />
          <StatBox
            label="Laporan"
            value={stats.laporanAktif}
            icon="alert-circle-outline"
            color="#f59e0b"
            bg="bg-amber-50 dark:bg-amber-500/10"
          />
        </View>

        {/* Menu Grid 2.0 */}
        <Typography variant="h3" className="mb-4 ml-1 dark:text-white">
          Squad Service
        </Typography>
        <View className="flex-row flex-wrap justify-between">
          <ActionMenu
            title="Aktivitas"
            desc="Input Kegiatan"
            icon="briefcase-outline"
            color="bg-blue-500"
            onPress={() => navigation.navigate("FormAktivitas")}
          />
          <ActionMenu
            title="Lapor"
            desc="Masalah Area"
            icon="megaphone-outline"
            color="bg-red-500"
            onPress={() => navigation.navigate("FormLaporan")}
          />
          <ActionMenu
            title="Chat AI"
            desc="Tanya Bantuan"
            icon="sparkles-outline"
            color="bg-emerald-500"
            onPress={() => navigation.navigate("ChatAIScreen")}
          />
          <ActionMenu
            title="Riwayat"
            desc="Log Kerja"
            icon="time-outline"
            color="bg-purple-500"
            onPress={() => navigation.navigate("RiwayatSaya")}
          />
        </View>

        {/* --- BANNER MOTIVASI SQUAD --- */}
        <View
          className={`mt-4 mb-4 overflow-hidden rounded-[32px] border ${
            isDark
              ? "bg-slate-800/30 border-primary/20"
              : "bg-white border-slate-100 shadow-sm"
          }`}>
          <TouchableOpacity
            activeOpacity={0.9}
            className="flex-row items-center p-6"
            onPress={() =>
              showToast("Push terus Bre, dikit lagi gajian! (Mungkin)", "info")
            }>
            <View className="flex-1">
              <View
                className={`${isDark ? "bg-primary/20" : "bg-primary/10"} self-start px-2 py-1 rounded-lg mb-2`}>
                <Typography className="text-[9px] font-black text-primary uppercase italic">
                  Daily Mood Booster
                </Typography>
              </View>

              <Typography
                className={`font-black text-lg leading-6 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                Pesan Dari Semesta 🌌
              </Typography>

              {/* Teks Motivasi Random */}
              <Typography
                className={`text-[12px] mt-2 font-medium italic leading-5 ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}>
                "{quotesKuli[Math.floor(Math.random() * quotesKuli.length)]}"
              </Typography>

              <View className="mt-4 flex-row items-center bg-slate-100 dark:bg-slate-800 self-start px-3 py-1.5 rounded-full">
                <Typography className="text-slate-500 font-bold text-[10px] mr-2">
                  Tap buat dapet pencerahan
                </Typography>
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={14}
                  color="#f59e0b"
                />
              </View>
            </View>

            <View
              className={`ml-2 rotate-12 ${isDark ? "opacity-20" : "opacity-10"}`}>
              <MaterialCommunityIcons
                name="arm-flex-outline"
                size={70}
                color={isDark ? "#ffffff" : "#0f172a"}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- BANNER KEBANGGAAN SQUAD (REVISI VISUAL) --- */}
        <View
          className={`mt-2 mb-20 overflow-hidden rounded-[28px] border ${
            isDark
              ? "bg-slate-800/50 border-primary/20"
              : "bg-blue-50 border-blue-100 shadow-sm"
          }`}>
          <TouchableOpacity
            activeOpacity={0.9}
            className="flex-row items-center p-5"
            onPress={() =>
              showToast("Kerja bagus hari ini, Bre! 👊", "success")
            }>
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color="#0099ff"
                />
                <Typography className="text-[10px] font-black text-primary ml-1 uppercase tracking-widest">
                  Certified Professional
                </Typography>
              </View>

              {/* REVISI DISINI BRE: Tambahin leading-relaxed biar shield & text gak kepotong atasnya */}
              <Typography
                className={`font-black text-base leading-7 ${isDark ? "text-white" : "text-slate-900"}`}>
                Garda Kenyamanan Gedung 🛡️
              </Typography>

              <Typography
                className={`text-[11px] mt-1 leading-4 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Tanpa sapu dan tangan dingin lu, tempat ini cuma tumpukan debu.
                Respek penuh buat dedikasi lu hari ini, Bre!
              </Typography>
            </View>

            {/* Bagian Icon Kanan tetep aman */}
            <View
              className={`ml-3 w-14 h-14 items-center justify-center rounded-2xl ${isDark ? "bg-slate-700" : "bg-white shadow-sm"}`}>
              <MaterialCommunityIcons
                name="star-face"
                size={32}
                color="#f59e0b"
              />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
};

// --- SUB COMPONENTS ---

const StatBox = ({ label, value, icon, color, bg }: any) => (
  <View className="bg-white dark:bg-slate-800 w-[48%] p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-700 items-center">
    <View className={`${bg} p-3 rounded-2xl mb-2`}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Typography variant="h2" className="text-2xl dark:text-white">
      {value}
    </Typography>
    <Typography variant="caption" className="text-slate-400">
      {label}
    </Typography>
  </View>
);

export const ActionMenu = ({ title, desc, icon, color, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className="bg-white dark:bg-slate-800 w-[48%] mb-4 p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-700 items-center">
    <View
      className={`${color} w-10 h-10 items-center justify-center rounded-xl mb-3 shadow-lg shadow-${color.split("-")[1]}-500/20`}>
      <Ionicons name={icon} size={22} color="white" />
    </View>
    <Typography className="font-bold text-slate-800 dark:text-slate-100">
      {title}
    </Typography>
    <Typography className="text-[10px] text-slate-400 mt-0.5">
      {desc}
    </Typography>
  </TouchableOpacity>
);
