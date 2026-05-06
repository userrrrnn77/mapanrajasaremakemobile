import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Container,
  Typography,
  Header,
  Modal,
  Toast,
  Dropdown,
  Badge,
} from "../../components";
import { getMyAttendanceReq, IAttendanceFE } from "../../api/attendance";
import { useTheme } from "../../context/useThemeStore";

const RekapAbsen = () => {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState<IAttendanceFE[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IAttendanceFE | null>(
    null,
  );
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as any,
  });

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const firstDay = new Date(selectedYear, selectedMonth, 1);
      const lastDay = new Date(selectedYear, selectedMonth + 1, 0);

      const formatDate = (date: Date) => {
        const d = date.getDate().toString().padStart(2, "0");
        const m = (date.getMonth() + 1).toString().padStart(2, "0");
        const y = date.getFullYear();
        return `${y}-${m}-${d}`;
      };

      const res = await getMyAttendanceReq({
        startDate: formatDate(firstDay),
        endDate: formatDate(lastDay),
      });

      if (res.success) {
        setAttendance(res.data);
      }
    } catch (err: any) {
      showToast("Gagal tarik riwayat absen", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedMonth, selectedYear]);

  const monthOptions = [
    { label: "Januari", value: 0 },
    { label: "Februari", value: 1 },
    { label: "Maret", value: 2 },
    { label: "April", value: 3 },
    { label: "Mei", value: 4 },
    { label: "Juni", value: 5 },
    { label: "Juli", value: 6 },
    { label: "Agustus", value: 7 },
    { label: "September", value: 8 },
    { label: "Oktober", value: 9 },
    { label: "November", value: 10 },
    { label: "Desember", value: 11 },
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { label: year.toString(), value: year };
  });

  const handleOpenDetail = (record: IAttendanceFE) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "tepat_waktu":
        return "bg-green-500";
      case "terlambat":
        return "bg-orange-500";
      case "sakit":
      case "izin":
        return "bg-blue-500";
      default:
        return "bg-slate-400";
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return "--:--";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDateFull = (dayKey: string) => {
    const d = new Date(dayKey);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Container className="px-0 bg-slate-50 dark:bg-slate-900">
      <Header title="Rekap Absensi" showBack />
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      <View className="flex-row gap-x-3 px-6 py-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 shadow-sm z-10">
        <View className="flex-1">
          <Dropdown
            options={monthOptions}
            value={selectedMonth}
            onSelect={(v) => setSelectedMonth(Number(v))}
            placeholder="Bulan"
          />
        </View>
        <View className="w-1/3">
          <Dropdown
            options={yearOptions}
            value={selectedYear}
            onSelect={(v) => setSelectedYear(Number(v))}
            placeholder="Tahun"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchAttendance}
            tintColor="#0099ff"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0099ff" className="mt-10" />
        ) : (
          <>
            {attendance.length === 0 ? (
              <View className="items-center mt-20">
                <Ionicons
                  name="calendar-outline"
                  size={64}
                  className="text-slate-300 dark:text-slate-600"
                />
                <Typography
                  variant="h3"
                  className="text-slate-800 dark:text-white mt-4">
                  Data Kosong
                </Typography>
                <Typography className="text-slate-400 text-center mt-2">
                  Belum ada riwayat absen di periode ini.
                </Typography>
              </View>
            ) : (
              attendance.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  onPress={() => handleOpenDetail(item)}
                  activeOpacity={0.7}
                  className="bg-white dark:bg-slate-800 p-5 rounded-[28px] mb-4 border border-slate-100 dark:border-slate-700 shadow-sm">
                  <View className="flex-row justify-between items-center mb-4">
                    <View>
                      <Typography className="text-slate-400 text-[10px] font-bold uppercase tracking-tighter">
                        {formatDateFull(item.attendanceDayKey)}
                      </Typography>
                      <Typography
                        variant="h3"
                        className="text-slate-800 dark:text-white mt-0.5 uppercase">
                        Shift {item.shift || "N/A"}
                      </Typography>
                    </View>
                    <View
                      className={`${getStatusColor(item.status)} px-3 py-1 rounded-full`}>
                      <Typography className="text-white text-[9px] font-black uppercase">
                        {item.status.replace("_", " ")}
                      </Typography>
                    </View>
                  </View>

                  <View className="flex-row items-center gap-x-3 mt-1">
                    <View className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <Typography className="text-[9px] text-slate-400 font-bold uppercase">
                        Masuk
                      </Typography>
                      <Typography className="text-slate-700 dark:text-slate-200 font-bold">
                        {formatTime(item.checkIn)}
                      </Typography>
                    </View>
                    <View className="flex-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <Typography className="text-[9px] text-slate-400 font-bold uppercase">
                        Pulang
                      </Typography>
                      <Typography className="text-slate-700 dark:text-slate-200 font-bold">
                        {formatTime(item.checkOut)}
                      </Typography>
                    </View>
                  </View>

                  {item.lateMinutes > 0 && (
                    <View className="mt-3 flex-row items-center bg-orange-50 dark:bg-orange-500/10 p-2 rounded-xl">
                      <Ionicons name="alert-circle" size={14} color="#f97316" />
                      <Typography className="text-orange-500 text-[10px] font-bold ml-1">
                        Terlambat {item.lateMinutes} Menit
                      </Typography>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Detail Absensi">
        {selectedRecord && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="max-h-[80vh]">
            <View className="items-center mb-6 shadow-xl">
              <Image
                source={{ uri: selectedRecord.photo.url }}
                className="w-full h-72 rounded-3xl bg-slate-200"
                resizeMode="cover"
              />
              <View className="absolute bottom-4 left-4 right-4 bg-black/40 p-3 rounded-2xl backdrop-blur-md">
                <Typography className="text-white text-[10px] font-bold uppercase">
                  {selectedRecord.locationSnapshot?.name || "Lokasi Kerja"}
                </Typography>
              </View>
            </View>

            <View className="gap-y-3 mb-8">
              <View className="flex-row justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Typography className="text-slate-400">Total Denda</Typography>
                <Typography className="text-red-500 font-bold">
                  Rp {selectedRecord.penalty.toLocaleString("id-ID")}
                </Typography>
              </View>
              <View className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Typography className="text-slate-400 mb-2 font-bold uppercase text-[10px]">
                  Catatan
                </Typography>
                <Typography className="text-slate-700 dark:text-slate-300 italic">
                  "{selectedRecord.note || "Tidak ada catatan"}"
                </Typography>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="bg-primary p-5 rounded-[20px] items-center mb-10 shadow-lg shadow-primary/30">
              <Typography className="text-white font-bold text-lg">
                Tutup
              </Typography>
            </TouchableOpacity>
          </ScrollView>
        )}
      </Modal>
    </Container>
  );
};

export default RekapAbsen;
