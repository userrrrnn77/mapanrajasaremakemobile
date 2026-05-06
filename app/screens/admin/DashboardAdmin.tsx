import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Text,
} from "react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { getAllUserReq, getDashboardStatsReq } from "../../api/user";
import { getAllActivityReq } from "../../api/activity";
import { Avatar, Container, Header, Toast, Typography } from "../../components";
import { useAuthStore } from "../../context/useAuthStore";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const AdminDashboard = () => {
  const navigation = useNavigation<any>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user } = useAuthStore();

  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info" as "success" | "error" | "info",
  });

  const showToast = useCallback(
    (message: string, type: "success" | "error" | "info" = "success") => {
      setToast({ visible: true, message, type });
      setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 3000);
    },
    [],
  );

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const [statsRes, activityRes, userRes] = await Promise.all([
        getDashboardStatsReq(),
        getAllActivityReq(),
        getAllUserReq(),
      ]);

      setStats(statsRes.data.data);
      setUsers(userRes.data.data);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message || err.message || "Gagal narik data";
      showToast(errMsg, "error");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCleaning = users.filter(
    (k) => k.role === "cleaning_service",
  ).length;

  return (
    <Container className="px-0 bg-slate-50 dark:bg-slate-900">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />
      <Header
        title="Command Center"
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchData}
            tintColor="#0099ff"
            colors={["#0099ff"]}
          />
        }>
        {/* Welcome Section Admin */}
        <View className="mb-6">
          <Typography
            variant="h1"
            className="text-3xl text-slate-900 dark:text-white">
            Halo, {user?.username?.split(" ")[0]}! 🎖️
          </Typography>
          <Typography className="text-slate-500 mt-1">
            Data otomatis reset setiap pukul 00:00
          </Typography>
        </View>

        {/* Bento Grid Stats (Gaya Dashboard Cleaning) */}
        <View className="flex-row justify-between mb-6">
          <StatBox
            label="Cleaning Aktif"
            value={totalCleaning}
            icon="people-outline"
            color="#3b82f6"
            bg="bg-blue-50 dark:bg-blue-500/10"
          />
          <StatBox
            label="Laporan Baru"
            value={stats?.totalReports || 0}
            icon="alert-circle-outline"
            color="#f59e0b"
            bg="bg-amber-50 dark:bg-amber-500/10"
          />
        </View>

        {/* Secondary Detailed Stats Row */}
        <View className="bg-white dark:bg-slate-800 p-6 rounded-[32px] shadow-sm border border-slate-100 dark:border-slate-700 mb-8 flex-row justify-around">
          <View className="items-center">
            <Typography className="text-green-500 text-xl font-black">
              {stats?.presentToday || 0}
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              Hadir
            </Typography>
          </View>
          <View className="w-[1px] h-8 bg-slate-100 dark:bg-slate-700" />
          <View className="items-center">
            <Typography className="text-orange-500 text-xl font-black">
              {stats?.lateToday || 0}
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              Telat
            </Typography>
          </View>
          <View className="w-[1px] h-8 bg-slate-100 dark:bg-slate-700" />
          <View className="items-center">
            <Typography className="text-red-500 text-xl font-black">
              {stats?.absentToday || 0}
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              Absen
            </Typography>
          </View>
        </View>

        {/* Menu Grid Bento Style */}
        <Typography variant="h3" className="mb-4 ml-1 dark:text-white">
          Kendali Skuad
        </Typography>
        <View className="flex-row flex-wrap justify-between">
          <ActionMenu
            title="Manajemen Karyawan"
            desc="Kelola Personil"
            icon="shield-checkmark-outline"
            color="bg-blue-600"
            onPress={() => navigation.navigate("UserManagement")}
          />
          <ActionMenu
            title="Rekap Absen"
            desc="Riwayat Presensi"
            icon="finger-print-outline"
            color="bg-indigo-500"
            onPress={() => navigation.navigate("LookAllAttendance")}
          />
          <ActionMenu
            title="Area Tempur"
            desc="Atur Lokasi"
            icon="location-outline"
            color="bg-rose-500"
            onPress={() => navigation.navigate("LocationControl")}
          />
          <ActionMenu
            title="Kotak Laporan"
            desc="Cek Kendala"
            icon="chatbubbles-outline"
            color="bg-amber-500"
            onPress={() => navigation.navigate("ReportCenter")}
          />
          <ActionMenu
            title="Log Aktivitas"
            desc="Dokumentasi Kerja"
            icon="camera-outline"
            color="bg-violet-500"
            onPress={() => navigation.navigate("LookAllActivity")}
          />
          <ActionMenu
            title="Audit Sistem"
            desc="History Data"
            icon="layers-outline"
            color="bg-slate-600"
            onPress={() => navigation.navigate("LookAllLog")}
          />
        </View>

        {/* Integrity Banner (Leader's Creed) */}
        <View className="mt-6 mb-20 bg-slate-300 dark:bg-slate-600/50 p-6 rounded-[32px] overflow-hidden border border-white/10 shadow-xl shadow-black/20">
          <View className="flex-row items-center mb-2">
            <Ionicons name="ribbon-outline" size={24} color="#3b82f6" />
            <Text className="text-[#3b82f6] font-bold ml-2 uppercase tracking-widest text-[10px]">
              Leader's Creed
            </Text>
          </View>
          <Text className="dark:text-white text-lg font-bold leading-tight">
            Kendali ada di tanganmu, tapi keadilan adalah tanggung jawabmu.
          </Text>
          <Text className="text-slate-700 dark:text-white text-xs mt-2 italic">
            "Seorang pemimpin hebat tidak hanya memerintah, tapi memastikan
            setiap karyawan mendapatkan haknya dengan adil."
          </Text>
          <View className="mt-4 flex-row items-center opacity-50">
            <Ionicons name="fitness-outline" size={12} color="gray" />
            <Text className="text-gray-950 text-[10px] ml-1 dark:text-white">
              Mapan Rajasa Integrity System
            </Text>
          </View>
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
    <Typography variant="caption" className="text-slate-400 text-center">
      {label}
    </Typography>
  </View>
);

const ActionMenu = ({ title, desc, icon, color, onPress, isLarge }: any) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className={`bg-white dark:bg-slate-800 ${isLarge ? "w-full" : "w-[48%]"} mb-4 p-5 rounded-[28px] shadow-sm border border-slate-100 dark:border-slate-700 items-center`}>
    <View
      className={`${color} w-10 h-10 items-center justify-center rounded-xl mb-3 shadow-lg shadow-black/10`}>
      <Ionicons name={icon} size={22} color="white" />
    </View>
    <Typography className="font-bold text-slate-800 dark:text-slate-100 text-center">
      {title}
    </Typography>
    <Typography className="text-[10px] text-slate-400 mt-0.5 text-center">
      {desc}
    </Typography>
  </TouchableOpacity>
);

export default AdminDashboard;
