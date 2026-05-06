import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import {
  Container,
  Typography,
  Input,
  Button,
  Avatar,
  Header,
  Toast,
  Divider,
} from "../../components/index";
import { useAuthStore } from "../../context/useAuthStore";
import { getMyProfile } from "../../api/user";
import { updateMeReq } from "../../api/auth";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useKamera } from "../../hooks/useKamera";
import { useUpload } from "../../hooks/useUpload";
import { useThemeStore } from "../../context/useThemeStore";
import { useColorScheme } from "nativewind";

export const ProfileScreen = () => {
  const { user, setAuth, clearAuth, token } = useAuthStore();
  const { image, setImage, bukaGaleri } = useKamera();
  const { prosesUpload, isUploading } = useUpload();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // States
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Data detail (read-only)
  const [profileData, setProfileData] = useState<any>(null);

  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const userId = user?._id || user?.id; // ← tambah fallback
    if (!userId) {
      setFetching(false);
      return;
    }

    try {
      const res = await getMyProfile();
      const data = res.data.data;

      setProfileData(data);
      setUsername(data.username);
    } catch (error) {
      showToast("Gagal narik data squad!", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const body: any = {};
      if (username !== profileData?.username) body.username = username;
      if (password) body.password = password;

      if (Object.keys(body).length === 0) {
        return showToast("Gak ada yang diubah, Bre!", "error");
      }

      const res = await updateMeReq(body);
      await setAuth(res.data, token || "");
      showToast("Profil berhasil di-remake!", "success");
      setPassword("");
    } catch (error: any) {
      showToast(error.response?.data?.message || "Gagal update!", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => setShowLogoutModal(true);

  const handleGantiFoto = async () => {
    const uri = await bukaGaleri(true);
    if (!uri) return;

    const uploaded = await prosesUpload(uri, "avatars");
    if (!uploaded) return;

    try {
      const res = await updateMeReq({ profilePhoto: uploaded });
      await setAuth(res.data, token || "");
      await fetchProfile();
      showToast("Foto berhasil diupdate!", "success");
    } catch (error: any) {
      setImage(null);
      showToast(error.response?.data?.message || "Gagal update foto!", "error");
    }
  };

  const handleToggleTheme = () => {
    setColorScheme(isDark ? "light" : "dark");
  };

  if (fetching)
    return (
      <Container className="px-0 bg-slate-50 dark:bg-slate-900">
        <Header title="Profil" showBack />
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Skeleton Profile Card */}
          <View className="items-center py-8 bg-white dark:bg-slate-800 rounded-b-[48px] shadow-sm">
            <View className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse border-4 border-slate-100 dark:border-slate-600" />
            <View className="mt-4 h-8 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl" />
            <View className="mt-2 h-6 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full" />
          </View>

          <View className="px-6 -mt-6 gap-y-4">
            {/* Skeleton Detail Penugasan */}
            <View className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700">
              <View className="h-6 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg mb-6" />
              {[1, 2, 3].map((i) => (
                <View
                  key={i}
                  className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <View className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 animate-pulse" />
                    <View className="ml-3 h-4 w-20 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-md" />
                  </View>
                  <View className="h-4 w-24 bg-slate-100 dark:bg-slate-700 animate-pulse rounded-md" />
                </View>
              ))}
            </View>

            {/* Skeleton Form Section */}
            <View className="bg-white dark:bg-slate-800 p-6 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700">
              <View className="h-6 w-32 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-lg mb-6" />
              <View className="h-14 w-full bg-slate-100 dark:bg-slate-700 animate-pulse rounded-2xl mb-4" />
              <View className="h-14 w-full bg-slate-100 dark:bg-slate-700 animate-pulse rounded-2xl mb-4" />
              <View className="h-14 w-full bg-primary/10 animate-pulse rounded-2xl" />
            </View>
          </View>
        </ScrollView>
      </Container>
    );

  return (
    <Container className="px-0 bg-slate-50 dark:bg-slate-900">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />
      <Header title="Profil" showBack />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Profile Card Remake */}
        <View className="items-center py-8 bg-white dark:bg-slate-800 rounded-b-[48px] shadow-sm">
          <View className="relative">
            <Avatar
              uri={image || profileData?.profilePhoto?.url}
              size="xl"
              name={profileData?.fullname}
              className="border-4 border-primary/20"
            />
            <TouchableOpacity
              activeOpacity={0.8}
              className="absolute bottom-0 right-0 bg-primary p-2.5 rounded-full border-4 border-white dark:border-slate-800"
              onPress={handleGantiFoto}
              disabled={isUploading}>
              <MaterialCommunityIcons
                name={isUploading ? "loading" : "image-edit"}
                size={18}
                color="white"
              />
            </TouchableOpacity>
          </View>

          <Typography
            variant="h2"
            className="mt-4 text-slate-900 dark:text-white">
            {profileData?.fullname}
          </Typography>
          <View className="flex-row items-center mt-1 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
            <View className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            <Typography
              variant="caption"
              className="font-bold uppercase tracking-widest dark:text-white">
              {profileData?.role?.replace("_", " ")}
            </Typography>
          </View>
        </View>

        <View className="px-6 -mt-6">
          {/* Detail Penugasan Section */}
          <View className="bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm mb-4 border border-slate-100 dark:border-slate-700">
            <Typography variant="h3" className="mb-4 text-primary">
              Detail Penugasan
            </Typography>
            <InfoItem icon="phone" label="Phone" value={profileData?.phone} />
            <InfoItem
              icon="map-marker"
              label="Lokasi"
              value={
                profileData?.assignedWorkLocations?.[0]?.name ||
                "Belum ada lokasi"
              }
            />
            <InfoItem
              icon="shield-check"
              label="BPJS"
              value={profileData?.bpjsKesehatan ? "Aktif" : "Non-Aktif"}
              isLast
            />
          </View>

          {/* Edit Form Section */}
          <View className="bg-white dark:bg-slate-800 p-5 rounded-[24px] shadow-sm border border-slate-100 dark:border-slate-700">
            <Typography variant="h3" className="mb-4 text-primary">
              Keamanan Akun
            </Typography>
            <View className="gap-y-4">
              <Input
                label="Username Squad"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <Input
                label="Password Baru"
                placeholder="Kosongkan jika tak ganti"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity
                onPress={handleToggleTheme}
                className="flex-row items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name={isDark ? "weather-night" : "weather-sunny"}
                    size={20}
                    color={isDark ? "#a78bfa" : "#f59e0b"}
                  />
                  <Typography className="ml-3 font-semibold dark:text-white">
                    Mode {isDark ? "Gelap" : "Terang"}
                  </Typography>
                </View>
                <MaterialCommunityIcons
                  name={isDark ? "toggle-switch" : "toggle-switch-off"}
                  size={36}
                  color={isDark ? "#7c3aed" : "#94a3b8"}
                />
              </TouchableOpacity>

              <Button
                title="SIMPAN PERUBAHAN"
                onPress={handleSave}
                loading={loading}
                className="mt-2 rounded-2xl shadow-lg shadow-primary/30 bg-primary h-12 justify-center items-center text-center"
              />
            </View>
          </View>

          {/* Settings Section */}
          <TouchableOpacity
            onPress={handleLogout}
            className="mt-6 flex-row items-center justify-center bg-red-50 dark:bg-red-500/10 p-4 rounded-2xl border border-red-100 dark:border-red-500/20">
            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
            <Typography className="text-red-500 font-bold ml-2">
              Logout dari System
            </Typography>
          </TouchableOpacity>
        </View>

        <Typography
          variant="caption"
          className="text-center mt-10 text-slate-400">
          MAPAN RAJASA V1.0.0 - Manage By Bre.Corp
        </Typography>
      </ScrollView>

      {showLogoutModal && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center px-6">
          <View className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full">
            <Typography
              variant="h3"
              className="text-center mb-2 dark:text-white">
              Cabut Squad? 👋
            </Typography>
            <Typography
              variant="caption"
              className="text-center text-slate-500 mb-6">
              Data login lu bakal dihapus dari device ini.
            </Typography>
            <View className="flex-col gap-y-3">
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                className="p-4 rounded-2xl bg-slate-100 dark:text-white dark:bg-slate-700 items-center">
                <Typography className="font-bold dark:text-white">
                  Batal
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowLogoutModal(false);
                  clearAuth();
                }}
                className="p-4 rounded-2xl bg-red-500 items-center">
                <Typography className="text-white font-bold">
                  Ya, Cabut!
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </Container>
  );
};

// Sub-component biar rapi
const InfoItem = ({ icon, label, value, isLast = false }: any) => (
  <View
    className={`flex-row items-center justify-between py-3 ${!isLast ? "border-b border-slate-50 dark:border-slate-700" : ""}`}>
    <View className="flex-row items-center">
      <View className="w-8 h-8 bg-slate-50 dark:bg-slate-700 items-center justify-center rounded-lg">
        <MaterialCommunityIcons name={icon} size={18} color="#64748b" />
      </View>
      <Typography variant="caption" className="ml-3 text-slate-500">
        {label}
      </Typography>
    </View>
    <Typography className="font-semibold text-slate-700 dark:text-slate-200">
      {value || "-"}
    </Typography>
  </View>
);
