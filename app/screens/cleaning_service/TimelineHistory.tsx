import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { getMyTimelineReq } from "../../api/user";
import { useThemeStore } from "../../context/useThemeStore";
import {
  Container,
  Header,
  Typography,
  Card,
  EmptyState,
  Toast,
  Modal,
} from "../../components/index";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

export default function TimelineHistory({ navigation }: any) {
  const { theme } = useThemeStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [isResetDay, setIsResetDay] = useState(false);

  // Modal Detail States
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

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

  const fetchTimeline = async () => {
    const today = new Date();

    if (today.getDate() === 7) {
      setIsResetDay(true);
      setData([]);
      setLoading(false);
      return;
    }

    setIsResetDay(false);

    try {
      setLoading(true);

      const res = await getMyTimelineReq();

      setData(res.data || []);
    } catch (error: any) {
      console.log("TIMELINE ERROR:", error);

      showToast("Gagal narik riwayat, server lagi puyeng!", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const openDetail = (item: any) => {
    setSelectedItem(item);
    setModalVisible(true);
  };

  const getKategoriStyle = (kat: string) => {
    switch (kat) {
      case "ABSENSI":
        return {
          bg: "bg-blue-500/10",
          text: "text-white",
          icon: "fingerprint",
        };
      case "LAPORAN":
        return {
          bg: "bg-red-500/10",
          text: "text-red-500",
          icon: "alert-decagram",
        };
      case "AKTIVITAS":
        return {
          bg: "bg-green-500/10",
          text: "text-green-500",
          icon: "briefcase-check",
        };
      default:
        // Default case buat handle semua data sisa biar tetep tampil josjis
        return {
          bg: "bg-purple-500/10",
          text: "text-purple-500",
          icon: "clock-fast",
        };
    }
  };

  return (
    <Container className="bg-background dark:bg-slate-950">
      <Toast message={toast.msg} type={toast.type} visible={toast.visible} />
      <Header title="My Timeline" showBack onBack={() => navigation.goBack()} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0099ff" />
        </View>
      ) : isResetDay ? (
        <View className="flex-1 justify-center px-10">
          <EmptyState
            title="Sistem Reset Otomatis"
            description="Hari ini tanggal 7, semua riwayat dibersihkan sementara biar HP lu kaga meledak, Bre!"
          />
          <Typography className="text-center text-gray-400 mt-4 text-xs italic">
            Balik lagi besok buat liat riwayat lu.
          </Typography>
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchTimeline();
              }}
              tintColor="#0099ff"
            />
          }
          className="px-4 py-4"
          showsVerticalScrollIndicator={false}>
          <Typography
            variant="h2"
            className="mb-6 dark:text-white font-black text-2xl">
            Aktivitas Terbaru
          </Typography>

          {data.length === 0 ? (
            <EmptyState
              title="Kosong Melompong"
              description="Belum ada riwayat kerja rodi hari ini."
            />
          ) : (
            data.map((item, index) => {
              const style = getKategoriStyle(item.kategori);
              const date = new Date(item.createdAt).toLocaleDateString(
                "id-ID",
                {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                },
              );

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => openDetail(item)}
                  activeOpacity={0.8}>
                  <View className="flex-row mb-8">
                    {/* Visual Timeline Line */}
                    <View className="items-center mr-4">
                      <View
                        className={`w-11 h-11 rounded-full ${style.bg} items-center justify-center border border-white/10 shadow-sm`}>
                        <MaterialCommunityIcons
                          name={style.icon as any}
                          size={22}
                          color={
                            style.text === "text-white"
                              ? "#3b82f6"
                              : style.text === "text-red-500"
                                ? "#ef4444"
                                : style.text === "text-green-500"
                                  ? "#22c55e"
                                  : "#a855f7"
                          }
                        />
                      </View>
                      {index !== data.length - 1 && (
                        <View className="w-[1.5px] flex-1 bg-gray-200 dark:bg-slate-800 my-2" />
                      )}
                    </View>

                    {/* Timeline Card */}
                    <Card className="flex-1 p-5 bg-card dark:bg-slate-900 border-border rounded-[28px] shadow-lg">
                      <View className="flex-row justify-between items-center mb-3">
                        <View className={`px-2 py-1 rounded-lg ${style.bg}`}>
                          <Typography
                            className={`text-[9px] font-black uppercase ${style.text}`}>
                            {item.kategori}
                          </Typography>
                        </View>
                        <Typography className="text-gray-400 text-[10px]">
                          {date}
                        </Typography>
                      </View>

                      <Typography
                        variant="h3"
                        className="dark:text-white font-bold leading-5 mb-3"
                        numberOfLines={2}>
                        {item.displayDesc}
                      </Typography>

                      {/* Timeline Card Photo Logic */}
                      {(item.photos?.length > 0 ||
                        item.photo ||
                        item.documentation?.length > 0) && (
                        <View className="relative">
                          <Image
                            source={{
                              uri:
                                item.photos?.length > 0
                                  ? item.photos[0] // LAPORAN
                                  : item.photo?.url
                                    ? item.photo.url // ABSENSI
                                    : item.documentation?.[0]?.photo?.url, // AKTIVITAS (Ini biang keroknya!)
                            }}
                            className="w-full h-36 rounded-2xl border border-border"
                            resizeMode="cover"
                          />
                          {/* Label Jumlah Foto */}
                          {(item.photos?.length > 1 ||
                            item.documentation?.length > 1) && (
                            <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-lg">
                              <Typography className="text-white text-[10px] font-bold">
                                +
                                {(item.photos?.length ||
                                  item.documentation?.length) - 1}{" "}
                                Foto
                              </Typography>
                            </View>
                          )}
                        </View>
                      )}
                    </Card>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View className="h-20" />
        </ScrollView>
      )}

      {/* 🔥 OVERKILL DETAIL MODAL (MIND BLOWING) */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={`Detail ${selectedItem?.kategori || "Aktivitas"}`}>
        {selectedItem && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="max-h-[80vh]">
            {/* Social Style Photo Carousel */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row mb-6">
              {(() => {
                // 🔥 Kita kumpulin semua foto dari berbagai jenis kategori ke satu wadah (Array)
                const allPhotos = [
                  ...(selectedItem.photos || []), // Kalo dari Laporan
                  ...(selectedItem.photo ? [selectedItem.photo.url] : []), // Kalo dari Absensi
                  ...(selectedItem.documentation
                    ?.map((d: any) => d.photo?.url)
                    .filter(Boolean) || []), // Kalo dari Aktivitas
                ];

                return allPhotos.map((uri: string, i: number) => (
                  <View key={i} className="mr-4 shadow-2xl">
                    <Image
                      source={{ uri }}
                      className="w-72 h-96 rounded-[40px] border-2 border-primary/20"
                    />
                  </View>
                ));
              })()}
            </ScrollView>

            <View className="px-1">
              <Typography
                variant="h3"
                className="dark:text-white mb-2 font-black text-xl">
                Deskripsi
              </Typography>
              <Typography className="text-gray-500 dark:text-gray-400 leading-6 mb-6 text-sm">
                {selectedItem.displayDesc ||
                  "Tidak ada detail tambahan untuk kegiatan ini."}
              </Typography>

              <View className="bg-muted/50 p-5 rounded-[32px] mb-6">
                <View className="flex-row items-center mb-3">
                  <View className="bg-primary/20 p-2 rounded-full">
                    <MaterialCommunityIcons
                      name="map-marker-radius"
                      size={18}
                      color="#0099ff"
                    />
                  </View>
                  <Typography className="font-bold ml-3 text-sm dark:text-white">
                    Lokasi Terdeteksi
                  </Typography>
                </View>
                <Typography className="text-gray-500 dark:text-gray-400 text-xs leading-5">
                  {selectedItem.address ||
                    "Data alamat tidak tersedia secara spesifik."}
                </Typography>
              </View>

              {selectedItem.status && (
                <View className="flex-row justify-between items-center bg-primary/10 p-5 rounded-[32px] border border-primary/20">
                  <View>
                    <Typography className="text-primary font-bold text-xs uppercase">
                      Status Saat Ini
                    </Typography>
                    <Typography className="capitalize text-primary font-black text-lg">
                      {selectedItem.status.replace("_", " ")}
                    </Typography>
                  </View>
                  <MaterialCommunityIcons
                    name="check-decagram"
                    size={32}
                    color="#0099ff"
                  />
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </Modal>
    </Container>
  );
}
