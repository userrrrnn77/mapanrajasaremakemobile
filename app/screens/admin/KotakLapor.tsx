import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Container, Typography, Header, Modal, Badge } from "../../components";
import { getAllReportsReq, IReportFE } from "../../api/report";
import { useTheme } from "../../context/useThemeStore";

const KotakLapor = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState<IReportFE[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedReport, setSelectedReport] = useState<IReportFE | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await getAllReportsReq(1, 50);
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error("Gagal tarik laporan:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const handleOpenDetail = (report: IReportFE) => {
    setSelectedReport(report);
    setModalVisible(true);
  };

  // Helper biar mapping variant Badge gak error di TypeScript
  const getStatusColor = (
    status?: string,
  ): "success" | "warning" | "error" | "info" => {
    switch (status) {
      case "resolved":
        return "success";
      case "in_progress":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "info"; // Kita pake info sebagai pengganti primary biar sinkron sama Badge.tsx
    }
  };

  const renderItem = ({ item }: { item: IReportFE }) => (
    <TouchableOpacity
      onPress={() => handleOpenDetail(item)}
      activeOpacity={0.7}
      className="bg-white dark:bg-slate-800 p-5 rounded-[32px] mb-4 border border-slate-100 dark:border-slate-700 shadow-sm shadow-slate-200 dark:shadow-none">
      <View className="flex-row justify-between items-center mb-3">
        <Badge
          label={item.status?.toUpperCase() || "OPEN"}
          variant={getStatusColor(item.status)}
        />
        <Typography className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleDateString("id-ID")
            : "-"}
        </Typography>
      </View>

      <Typography
        variant="h3"
        className="text-slate-900 dark:text-white mb-2 leading-6"
        numberOfLines={2}>
        {item.description}
      </Typography>

      <View className="flex-row items-center mb-4">
        <Ionicons
          name="location"
          size={14}
          color={isDark ? "#94a3b8" : "#64748b"}
        />
        <Typography
          className="text-slate-500 dark:text-slate-400 text-xs ml-1 flex-1"
          numberOfLines={1}>
          {item.address}
        </Typography>
      </View>

      {item.photos && item.photos.length > 0 && (
        <View className="rounded-2xl overflow-hidden border border-slate-50 dark:border-slate-700">
          <Image
            source={{ uri: item.photos[0] }}
            className="w-full h-40 bg-slate-100 dark:bg-slate-700"
            resizeMode="cover"
          />
          {item.photos.length > 1 && (
            <View className="absolute bottom-3 right-3 bg-black/70 px-3 py-1 rounded-full border border-white/20">
              <Typography className="text-white text-[10px] font-bold">
                +{item.photos.length - 1} FOTO LAINNYA
              </Typography>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Container className="px-0 bg-slate-50 dark:bg-slate-950">
      <Header title="Kotak Laporan" showBack />

      <View className="flex-1 px-5 pt-4">
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0099ff" />
            <Typography className="mt-4 text-slate-400 animate-pulse">
              Menarik data laporan...
            </Typography>
          </View>
        ) : (
          <FlatList
            data={reports}
            keyExtractor={(item) => item._id || Math.random().toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0099ff"
                colors={["#0099ff"]}
              />
            }
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center mt-32">
                <View className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={48}
                    color={isDark ? "#475569" : "#cbd5e1"}
                  />
                </View>
                <Typography
                  variant="h3"
                  className="text-slate-400 dark:text-slate-500">
                  Area Aman Terkendali
                </Typography>
                <Typography className="text-slate-300 dark:text-slate-600 text-xs mt-1">
                  Belum ada laporan masuk dari kuli koding.
                </Typography>
              </View>
            }
          />
        )}
      </View>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Detail Laporan">
        {selectedReport && (
          <View className="pb-10">
            <View className="flex-row justify-between items-center mb-6 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
              <View>
                <Typography className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                  STATUS
                </Typography>
                <Badge
                  label={selectedReport.status?.toUpperCase() || "OPEN"}
                  variant={getStatusColor(selectedReport.status)}
                />
              </View>
              <View className="items-end">
                <Typography className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
                  PRIORITAS
                </Typography>
                <Typography
                  className={`font-black tracking-tighter ${selectedReport.priority === "high" ? "text-red-500" : "text-primary"}`}>
                  {selectedReport.priority?.toUpperCase() || "MEDIUM"}
                </Typography>
              </View>
            </View>

            <Typography
              variant="h3"
              className="text-primary mb-2 uppercase tracking-widest text-[10px] font-black">
              Deskripsi Masalah
            </Typography>
            <Typography className="text-slate-700 dark:text-slate-300 text-base leading-7 mb-8">
              {selectedReport.description}
            </Typography>

            <View className="bg-white dark:bg-slate-800 p-5 rounded-[32px] border border-slate-100 dark:border-slate-700 mb-8 shadow-sm">
              <View className="flex-row items-center mb-3">
                <View className="bg-red-100 dark:bg-red-500/20 p-2 rounded-xl">
                  <Ionicons name="location" size={18} color="#ef4444" />
                </View>
                <Typography
                  variant="h3"
                  className="ml-3 text-slate-800 dark:text-white">
                  Titik Lokasi
                </Typography>
              </View>
              <Typography className="text-slate-500 dark:text-slate-400 text-sm leading-5">
                {selectedReport.address}
              </Typography>
            </View>

            <Typography
              variant="h3"
              className="text-primary mb-4 uppercase tracking-widest text-[10px] font-black">
              Dokumentasi Foto ({selectedReport.photos?.length || 0})
            </Typography>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row mb-10">
              {selectedReport.photos?.map((photo, index) => (
                <View
                  key={index}
                  className="mr-4 rounded-[28px] overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg">
                  <Image
                    source={{ uri: photo }}
                    className="w-72 h-72 bg-slate-200 dark:bg-slate-700"
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
              className="bg-primary p-5 rounded-[24px] items-center shadow-xl shadow-primary/30">
              <Typography className="text-white font-bold text-lg">
                Paham, Bre!
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </Container>
  );
};

export default KotakLapor;
