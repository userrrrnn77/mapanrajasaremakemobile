import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Container,
  Typography,
  Header,
  Modal,
  Toast,
  Avatar,
  Dropdown,
  Input,
} from "../../components";
import {
  getAllUserReq,
  createUserReq,
  updateUserAssignmentReq,
  verifyUserReq,
  deleteUserReq,
} from "../../api/user";
import { getAllLocationsReq, IWorkLocationFE } from "../../api/workLocation";
import { useTheme } from "../../context/useThemeStore";

export const USER_ROLES_OPTIONS = [
  { label: "Security", value: "security" },
  { label: "Cleaning Service", value: "cleaning_service" },
  { label: "Customer Service", value: "customer_service" },
  { label: "Gardener", value: "gardener" },
  { label: "Street", value: "street" },
];

const ManajemenKaryawan = () => {
  const { isDark } = useTheme();

  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [locations, setLocations] = useState<IWorkLocationFE[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isVerifiedTab, setIsVerifiedTab] = useState<boolean>(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [form, setForm] = useState({
    username: "",
    fullname: "",
    phone: "",
    password: "",
    role: "cleaning_service",
    assignedWorkLocations: [] as string[],
  });

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "default" as "default" | "danger",
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [userRes, locRes] = await Promise.all([
        getAllUserReq(),
        getAllLocationsReq(),
      ]);
      if (userRes.data.success) setUsers(userRes.data.data);
      if (locRes.success) setLocations(locRes.data);
    } catch (err: any) {
      showToast("Gagal tarik data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const locationOptions = locations.map((loc) => ({
    label: `${loc.name} (${loc.code})`,
    value: loc.code,
  }));

  const handleOpenCreate = () => {
    setForm({
      username: "",
      fullname: "",
      phone: "",
      password: "",
      role: "cleaning_service",
      assignedWorkLocations: [],
    });
    setModalType("create");
    setModalVisible(true);
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setForm({
      username: user.username,
      fullname: user.fullname,
      phone: user.phone,
      password: "",
      role: user.role,
      assignedWorkLocations:
        user.assignedWorkLocations?.map((l: any) => l.code) || [],
    });
    setModalType("edit");
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (modalType === "create") {
        const res = await createUserReq(form as any);
        showToast(res.message, "success");
      } else {
        const res = await updateUserAssignmentReq(
          selectedUser._id,
          form as any,
        );
        showToast(res.message, "success");
      }
      setModalVisible(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || "Gagal", "error");
    }
  };

  const confirmVerify = (user: any) => {
    setAlert({
      visible: true,
      title: "Verifikasi Karyawan",
      message: `Yakin mau acc Karyawan ${user.fullname}?`,
      type: "default",
      onConfirm: async () => {
        try {
          await verifyUserReq(user._id);
          showToast("User diverifikasi!", "success");
          setAlert((prev) => ({ ...prev, visible: false }));
          fetchData();
        } catch (err: any) {
          showToast("Gagal verifikasi", "error");
        }
      },
    });
  };

  const confirmDelete = (user: any) => {
    setAlert({
      visible: true,
      title: "Hapus dari Skuad",
      message: `Hapus ${user.fullname}? Status jadi inactive.`,
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteUserReq(user._id);
          showToast("User dinonaktifkan", "success");
          setAlert((prev) => ({ ...prev, visible: false }));
          fetchData();
        } catch (err: any) {
          showToast("Gagal hapus", "error");
        }
      },
    });
  };

  const filteredUsers = users.filter(
    (u) => u.role === "cleaning_service" && u.isVerified === isVerifiedTab,
  );

  return (
    <Container className="px-0 bg-slate-50 dark:bg-slate-900">
      <Header
        title="Squad Management"
        showBack
        rightElement={
          <TouchableOpacity
            onPress={handleOpenCreate}
            className="bg-primary p-2 rounded-full shadow-lg shadow-primary/30">
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        }
      />

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      <View className="flex-row px-6 mt-6 mb-4 bg-white dark:bg-slate-800 p-1.5 rounded-[24px] mx-6 border border-slate-100 dark:border-slate-700">
        <TouchableOpacity
          onPress={() => setIsVerifiedTab(true)}
          className={`flex-1 py-3 rounded-[20px] items-center ${isVerifiedTab ? "bg-primary" : ""}`}>
          <Typography
            className={
              isVerifiedTab ? "text-white font-bold" : "text-slate-400"
            }>
            Verified
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setIsVerifiedTab(false)}
          className={`flex-1 py-3 rounded-[20px] flex-row items-center justify-center ${!isVerifiedTab ? "bg-primary" : ""}`}>
          <Typography
            className={
              !isVerifiedTab ? "text-white font-bold" : "text-slate-400"
            }>
            Pending
          </Typography>
          {users.filter((u) => !u.isVerified && u.role === "cleaning_service")
            .length > 0 && (
            <View
              className={`ml-2 px-2 py-0.5 rounded-full ${!isVerifiedTab ? "bg-white" : "bg-red-500"}`}>
              <Typography
                className={`text-[10px] font-bold ${!isVerifiedTab ? "text-primary" : "text-white"}`}>
                {
                  users.filter(
                    (u) => !u.isVerified && u.role === "cleaning_service",
                  ).length
                }
              </Typography>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchData}
            tintColor="#0099ff"
          />
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#0099ff" className="mt-10" />
        ) : (
          <>
            {filteredUsers.length === 0 ? (
              <View className="items-center mt-20">
                <View className="bg-slate-100 dark:bg-slate-800 p-8 rounded-full mb-4">
                  <Ionicons
                    name={!isVerifiedTab ? "cafe-outline" : "people-outline"}
                    size={48}
                    className="text-slate-300 dark:text-slate-600"
                  />
                </View>
                <Typography
                  variant="h3"
                  className="text-slate-800 dark:text-white text-center">
                  {!isVerifiedTab ? "Gak ada antrean, Bre!" : "Skuad Kosong"}
                </Typography>
              </View>
            ) : (
              filteredUsers.map((item) => (
                <View
                  key={item._id}
                  className="bg-white dark:bg-slate-800 p-4 rounded-[28px] mb-4 border border-slate-100 dark:border-slate-700 shadow-sm flex-row items-center">
                  <Avatar
                    uri={item.profilePhoto?.url}
                    name={item.fullname}
                    size="md"
                  />
                  <View className="flex-1 ml-4">
                    <Typography
                      variant="h3"
                      className="text-slate-800 dark:text-white">
                      {item.fullname}
                    </Typography>
                    <Typography className="text-slate-400 text-[10px] font-bold">
                      {item.username} • {item.status.toUpperCase()}
                    </Typography>
                  </View>
                  <View className="flex-row">
                    {!isVerifiedTab ? (
                      <TouchableOpacity
                        onPress={() => confirmVerify(item)}
                        className="bg-green-500/10 p-2.5 rounded-full mr-2">
                        <Ionicons
                          name="checkmark-circle"
                          size={22}
                          color="#22c55e"
                        />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onPress={() => handleOpenEdit(item)}
                        className="bg-blue-500/10 p-2.5 rounded-full mr-2">
                        <Ionicons
                          name="create-outline"
                          size={22}
                          color="#0099ff"
                        />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      onPress={() => confirmDelete(item)}
                      className="bg-red-500/10 p-2.5 rounded-full">
                      <Ionicons
                        name="trash-outline"
                        size={22}
                        color="#ef4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalType === "create" ? "Tambah Karyawan" : "Edit Karyawan"}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="max-h-[80vh]">
          <View className="gap-y-4">
            {modalType === "create" && (
              <View>
                <Typography
                  variant="caption"
                  className="mb-2 ml-1 text-slate-400 font-bold uppercase">
                  Nama Lengkap
                </Typography>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-foreground border border-slate-500 dark:text-white dark:border-slate-800"
                  placeholder="Full Name"
                  placeholderTextColor={isDark ? "#fff" : "#999"}
                  value={form.fullname}
                  onChangeText={(t) => setForm({ ...form, fullname: t })}
                />
              </View>
            )}

            {modalType === "create" && (
              <View>
                <Typography
                  variant="caption"
                  className="mb-2 ml-1 text-slate-400 font-bold uppercase">
                  Username
                </Typography>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-foreground border border-slate-500 dark:text-white dark:border-slate-800"
                  placeholder="Username"
                  autoCapitalize="none"
                  placeholderTextColor={isDark ? "#fff" : "#999"}
                  value={form.username}
                  onChangeText={(t) => setForm({ ...form, username: t })}
                />
              </View>
            )}

            {modalType === "create" && (
              <View>
                <Typography
                  variant="caption"
                  className="mb-2 ml-1 text-slate-400 font-bold uppercase">
                  Phone
                </Typography>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl text-foreground border border-slate-500 dark:text-white dark:border-slate-800"
                  placeholder="Phone (08...)"
                  keyboardType="phone-pad"
                  placeholderTextColor={isDark ? "#fff" : "#999"}
                  value={form.phone}
                  onChangeText={(t) => setForm({ ...form, phone: t })}
                />
              </View>
            )}

            <Dropdown
              label="Role Jabatan"
              options={USER_ROLES_OPTIONS}
              value={form.role}
              onSelect={(v) => setForm({ ...form, role: v as string })}
            />

            <Dropdown
              label="Lokasi Penempatan"
              options={locationOptions}
              value={form.assignedWorkLocations[0] || ""}
              onSelect={(v) =>
                setForm({ ...form, assignedWorkLocations: [v as string] })
              }
              placeholder="Pilih lokasi..."
            />

            <Input
              label="Password"
              placeholder={
                modalType === "edit" ? "Kosongkan jika tak diganti" : "Password"
              }
              secureTextEntry
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
            />

            <TouchableOpacity
              onPress={handleSave}
              className="bg-primary p-5 rounded-2xl items-center mt-2 shadow-lg mb-6">
              <Typography className="text-white font-bold text-lg">
                {modalType === "create" ? "Gas Simpan" : "Update Data"}
              </Typography>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>

      {alert.visible && (
        <View className="absolute inset-0 z-50 flex-1 justify-center items-center bg-black/60 px-8">
          <View className="bg-white dark:bg-slate-800 w-full rounded-[32px] p-7 border border-slate-100 dark:border-slate-700 items-center">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-5 ${alert.type === "danger" ? "bg-red-100" : "bg-blue-100"}`}>
              <Ionicons
                name={
                  alert.type === "danger"
                    ? "trash-outline"
                    : "checkmark-circle-outline"
                }
                size={36}
                color={alert.type === "danger" ? "#ef4444" : "#0099ff"}
              />
            </View>
            <Typography
              variant="h2"
              className="mb-2 text-slate-900 dark:text-white">
              {alert.title}
            </Typography>
            <Typography className="text-slate-500 dark:text-slate-400 leading-6 mb-8">
              {alert.message}
            </Typography>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setAlert({ ...alert, visible: false })}
                className="flex-1 bg-slate-100 dark:bg-slate-700 p-4 rounded-2xl items-center">
                <Typography className="text-slate-600 dark:text-slate-300 font-bold">
                  Batal
                </Typography>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={alert.onConfirm}
                className={`flex-1 p-4 rounded-2xl items-center shadow-md ${alert.type === "danger" ? "bg-red-500" : "bg-primary"}`}>
                <Typography className="text-white font-bold">Gas!</Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Container>
  );
};

export default ManajemenKaryawan;
