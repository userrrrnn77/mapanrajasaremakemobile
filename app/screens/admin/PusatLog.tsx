import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Container, Typography, Header, Badge } from "../../components";
import { getAllActivityReq } from "../../api/activity";
import { getAllReportsReq } from "../../api/report";
import { getDashboardStatsReq } from "../../api/user";
import { useTheme } from "../../context/useThemeStore";

type LogTab = "absensi" | "aktivitas" | "laporan";

const PusatLog = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<LogTab>("absensi");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (tab: LogTab) => {
    setLoading(true);
    try {
      if (tab === "absensi") {
        // Ambil data dashboard untuk dapet info absensi real-time hari ini
        const res = await getDashboardStatsReq();
        // Catatan: Karena endpoint dashboard cuma kasih angka,
        // Idealnya lu butuh endpoint getAllAttendanceReq.
        // Tapi sementara kita simulasi stats atau data yang tersedia.
        setData(res.success ? [res.data] : []);
      } else if (tab === "aktivitas") {
        const res = await getAllActivityReq();
        setData(res.data.success ? res.data.data : []);
      } else if (tab === "laporan") {
        const res = await getAllReportsReq(1, 50);
        setData(res.success ? res.data : []);
      }
    } catch (err) {
      console.error("LOG_FETCH_ERROR:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(activeTab);
  };

  const TabItem = ({
    title,
    type,
    icon,
  }: {
    title: string;
    type: LogTab;
    icon: any;
  }) => (
    <TouchableOpacity
      onPress={() => setActiveTab(type)}
      className={`flex-1 flex-row items-center justify-center py-3 rounded-2xl mx-1 ${
        activeTab === type
          ? "bg-primary shadow-md shadow-primary/30"
          : "bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
      }`}>
      <Ionicons
        name={icon}
        size={16}
        color={activeTab === type ? "white" : isDark ? "#64748b" : "#94a3b8"}
      />
      <Typography
        className={`ml-2 text-[11px] font-bold uppercase tracking-tighter ${
          activeTab === type ? "text-white" : "text-slate-400"
        }`}>
        {title}
      </Typography>
    </TouchableOpacity>
  );

  const renderAbsensi = ({ item }: any) => (
    <View className="bg-white dark:bg-slate-900 p-5 rounded-[28px] mb-4 border border-slate-100 dark:border-slate-800 flex-row items-center">
      <View className="bg-green-100 dark:bg-green-500/10 p-3 rounded-2xl">
        <Ionicons name="finger-print" size={24} color="#10b981" />
      </View>
      <View className="ml-4 flex-1">
        <Typography variant="h3" className="text-slate-800 dark:text-white">
          Rekap Kehadiran
        </Typography>
        <Typography className="text-slate-400 text-xs">
          Total Hadir: {item.presentToday} Orang
        </Typography>
      </View>
      <Badge label="LIVE" variant="success" />
    </View>
  );

  const renderAktivitas = ({ item }: any) => (
    <View className="bg-white dark:bg-slate-900 p-4 rounded-[28px] mb-4 border border-slate-100 dark:border-slate-800">
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 items-center justify-center">
          <Ionicons name="construct" size={20} color="#3b82f6" />
        </View>
        <View className="ml-3">
          <Typography className="text-slate-900 dark:text-white font-bold">
            {item.user?.fullname}
          </Typography>
          <Typography className="text-slate-400 text-[10px]">
            {new Date(item.createdAt).toLocaleString("id-ID")}
          </Typography>
        </View>
      </View>
      <Typography
        variant="h3"
        className="mb-2 text-slate-800 dark:text-slate-200">
        {item.title}
      </Typography>
      {item.documentation?.[0] && (
        <Image
          source={{ uri: item.documentation[0].photo.url }}
          className="w-full h-32 rounded-2xl bg-slate-100"
        />
      )}
    </View>
  );

  const renderLaporan = ({ item }: any) => (
    <View className="bg-white dark:bg-slate-900 p-4 rounded-[28px] mb-4 border border-slate-100 dark:border-slate-800">
      <View className="flex-row justify-between mb-2">
        <Badge
          label={item.status.toUpperCase()}
          variant={item.status === "open" ? "error" : "success"}
        />
        <Typography className="text-slate-400 text-[10px]">
          {new Date(item.createdAt).toLocaleDateString()}
        </Typography>
      </View>
      <Typography variant="h3" className="text-slate-800 dark:text-white mb-1">
        {item.description}
      </Typography>
      <Typography className="text-slate-500 text-xs" numberOfLines={1}>
        📍 {item.address}
      </Typography>
    </View>
  );

  return (
    <Container className="px-0 bg-slate-50 dark:bg-slate-950">
      <Header title="Pusat Log Sistem" showBack />

      {/* TAB SELECTOR */}
      <View className="flex-row px-4 mt-4 mb-6">
        <TabItem title="Absen" type="absensi" icon="time" />
        <TabItem title="Aktivitas" type="aktivitas" icon="hammer" />
        <TabItem title="Laporan" type="laporan" icon="megaphone" />
      </View>

      <View className="flex-1 px-5">
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0099ff" className="mt-20" />
        ) : (
          <FlatList
            data={data}
            keyExtractor={(item, index) => item._id || index.toString()}
            renderItem={
              activeTab === "absensi"
                ? renderAbsensi
                : activeTab === "aktivitas"
                  ? renderAktivitas
                  : renderLaporan
            }
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0099ff"
              />
            }
            ListEmptyComponent={
              <Typography className="text-center text-slate-400 mt-20">
                Log masih kosong, Bre.
              </Typography>
            }
          />
        )}
      </View>
    </Container>
  );
};

export default PusatLog;
