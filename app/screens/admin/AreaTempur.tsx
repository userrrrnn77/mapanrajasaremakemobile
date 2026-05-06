import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
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
  Input,
  Badge,
} from "../../components";
import {
  getAllLocationsReq,
  createLocationReq,
  updateLocationReq,
  deleteLocationReq,
  IWorkLocationFE,
} from "../../api/workLocation";
import { useTheme } from "../../context/useThemeStore";

const WORK_ROLES_OPTIONS = [
  { label: "Security", value: "security" },
  { label: "Cleaning Service", value: "cleaning_service" },
  { label: "Customer Service", value: "customer_service" },
  { label: "Gardener", value: "gardener" },
  { label: "Street", value: "street" },
];

const LocationControl = () => {
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<IWorkLocationFE[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: "",
    name: "",
    role: "cleaning_service",
    lat: "",
    lng: "",
    radiusMeter: "100",
    isActive: true,
    shiftConfigs: {
      weekday: {
        pagi: { hour: 6, minute: 0, endHour: 14, endMinute: 0 },
        siang: { hour: 13, minute: 0, endHour: 19, endMinute: 0 },
        malam: { hour: 0, minute: 0, endHour: 0, endMinute: 0 },
      },
      weekend: {
        pagi: { hour: 6, minute: 0, endHour: 12, endMinute: 0 },
        siang: { hour: 13, minute: 0, endHour: 17, endMinute: 0 },
        malam: { hour: 0, minute: 0, endHour: 0, endMinute: 0 },
      },
    },
  });

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

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await getAllLocationsReq();
      if (res.success) setLocations(res.data);
    } catch (err) {
      showToast("Gagal tarik data area", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCodeChange = (text: string) => {
    const formatted = text.toUpperCase().replace(/\s+/g, "_");
    setForm({ ...form, code: formatted });
  };

  const handleOpenEdit = (loc: IWorkLocationFE) => {
    setSelectedId(loc._id);
    setForm({
      code: loc.code,
      name: loc.name,
      role: loc.role,
      lat: loc.center.coordinates[1].toString(),
      lng: loc.center.coordinates[0].toString(),
      radiusMeter: loc.radiusMeter.toString(),
      isActive: loc.isActive,
      shiftConfigs: loc.shiftConfigs,
    });
    setModalType("edit");
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...form,
        lat: parseFloat(form.lat),
        lng: parseFloat(form.lng),
        radiusMeter: parseInt(form.radiusMeter),
      };

      if (modalType === "create") {
        await createLocationReq(payload);
        showToast("Area baru berhasil dibuat!", "success");
      } else {
        await updateLocationReq(selectedId!, payload);
        showToast("Area berhasil diupdate!", "success");
      }
      setModalVisible(false);
      fetchLocations();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal simpan area", "error");
    }
  };

  const updateShift = (
    day: "weekday" | "weekend",
    shift: "pagi" | "siang" | "malam",
    field: string,
    val: string,
  ) => {
    const numVal = parseInt(val) || 0;
    setForm({
      ...form,
      shiftConfigs: {
        ...form.shiftConfigs,
        [day]: {
          ...form.shiftConfigs[day],
          [shift]: { ...form.shiftConfigs[day][shift], [field]: numVal },
        },
      },
    });
  };

  return (
    <Container className="px-0 bg-slate-50 dark:bg-slate-900">
      <Header
        title="Area Tempur"
        showBack
        rightElement={
          <TouchableOpacity
            onPress={() => {
              setModalType("create");
              setModalVisible(true);
            }}
            className="bg-primary p-2 rounded-full shadow-lg">
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchLocations}
            tintColor="#0099ff"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 20 }}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0099ff" className="mt-10" />
        ) : (
          locations.map((item) => (
            <TouchableOpacity
              key={item._id}
              onPress={() => handleOpenEdit(item)}
              className="bg-white dark:bg-slate-800 p-5 rounded-[28px] mb-4 border border-slate-100 dark:border-slate-700 shadow-sm flex-row items-center">
              <View className="bg-primary/10 p-3 rounded-2xl">
                <Ionicons name="location" size={24} color="#0099ff" />
              </View>
              <View className="flex-1 ml-4">
                <Typography
                  variant="h3"
                  className="text-slate-800 dark:text-white">
                  {item.name}
                </Typography>
                <Typography className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  {item.code} • {item.role.replace("_", " ")}
                </Typography>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalType === "create" ? "Area Baru" : "Update Area"}>
        <View className="gap-y-6">
          <Input
            label="KODE AREA (AUTO CAPS)"
            value={form.code}
            onChangeText={handleCodeChange}
            placeholder="CONTOH: FEB_UNDIP"
          />
          <Input
            label="NAMA LOKASI"
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
            placeholder="Nama Area Lengkap"
          />

          <Dropdown
            label="ROLE BERTUGAS"
            options={WORK_ROLES_OPTIONS}
            value={form.role}
            onSelect={(v) => setForm({ ...form, role: v as any })}
          />

          <View className="flex-row gap-x-3">
            <View className="flex-1">
              <Input
                label="LATITUDE"
                keyboardType="numeric"
                value={form.lat}
                onChangeText={(t) => setForm({ ...form, lat: t })}
                placeholder="-7.xxx"
              />
            </View>
            <View className="flex-1">
              <Input
                label="LONGITUDE"
                keyboardType="numeric"
                value={form.lng}
                onChangeText={(t) => setForm({ ...form, lng: t })}
                placeholder="110.xxx"
              />
            </View>
          </View>

          <Input
            label="RADIUS (METER)"
            keyboardType="numeric"
            value={form.radiusMeter}
            onChangeText={(t) => setForm({ ...form, radiusMeter: t })}
          />

          <Typography className="font-black text-primary mt-2 uppercase tracking-tighter">
            Setting Shift Kerja
          </Typography>

          {(["weekday", "weekend"] as const).map((day) => (
            <View
              key={day}
              className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
              <Typography className="font-bold uppercase mb-4 text-slate-500">
                {day === "weekday" ? "📅 Senin - Jumat" : "🏖️ Sabtu - Minggu"}
              </Typography>
              {(["pagi", "siang", "malam"] as const).map((shift) => (
                <View key={shift} className="mb-4">
                  <Typography className="text-[10px] font-bold mb-2 uppercase text-primary">
                    Shift {shift}
                  </Typography>
                  <View className="flex-row items-center gap-x-2">
                    <TextInput
                      className="flex-1 bg-white dark:bg-slate-800 p-2 rounded-lg text-center dark:text-white border border-slate-200 dark:border-slate-700"
                      keyboardType="numeric"
                      placeholder="HH"
                      maxLength={2}
                      value={form.shiftConfigs[day][shift].hour.toString()}
                      onChangeText={(v) => updateShift(day, shift, "hour", v)}
                    />
                    <Typography className="dark:text-white">:</Typography>
                    <TextInput
                      className="flex-1 bg-white dark:bg-slate-800 p-2 rounded-lg text-center dark:text-white border border-slate-200 dark:border-slate-700"
                      keyboardType="numeric"
                      placeholder="MM"
                      maxLength={2}
                      value={form.shiftConfigs[day][shift].minute.toString()}
                      onChangeText={(v) => updateShift(day, shift, "minute", v)}
                    />
                    <Typography className="mx-1 dark:text-white">→</Typography>
                    <TextInput
                      className="flex-1 bg-white dark:bg-slate-800 p-2 rounded-lg text-center dark:text-white border border-slate-200 dark:border-slate-700"
                      keyboardType="numeric"
                      placeholder="HH"
                      maxLength={2}
                      value={form.shiftConfigs[day][shift].endHour.toString()}
                      onChangeText={(v) =>
                        updateShift(day, shift, "endHour", v)
                      }
                    />
                    <Typography className="dark:text-white">:</Typography>
                    <TextInput
                      className="flex-1 bg-white dark:bg-slate-800 p-2 rounded-lg text-center dark:text-white border border-slate-200 dark:border-slate-700"
                      keyboardType="numeric"
                      placeholder="MM"
                      maxLength={2}
                      value={form.shiftConfigs[day][shift].endMinute.toString()}
                      onChangeText={(v) =>
                        updateShift(day, shift, "endMinute", v)
                      }
                    />
                  </View>
                </View>
              ))}
            </View>
          ))}

          <TouchableOpacity
            onPress={handleSave}
            className="bg-primary p-5 rounded-2xl items-center mt-4 shadow-lg">
            <Typography className="text-white font-bold text-lg">
              {modalType === "create" ? "Gas Buat Area" : "Simpan Perubahan"}
            </Typography>
          </TouchableOpacity>
        </View>
      </Modal>
    </Container>
  );
};

export default LocationControl;
