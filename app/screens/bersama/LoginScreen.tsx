import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import {
  Container,
  Typography,
  Input,
  Button,
  Toast,
  Dropdown, // Pake yang baru kita bikin Bre
} from "../../components/index";
import { useAuthStore } from "../../context/useAuthStore";
import { loginReq, regiterReq } from "../../api/auth";
import { getAllLocationsReq } from "../../api/workLocation";
import { Ionicons } from "@expo/vector-icons";

export const LoginScreen = () => {
  // UI State
  const [formLogin, setFormLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<
    { label: string; value: string }[]
  >([]);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });

  // Auth Store
  const setAuth = useAuthStore((state) => state.setAuth);

  // Form Fields State
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [locationCode, setLocationCode] = useState("");

  // Ambil data lokasi pas screen dibuka
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await getAllLocationsReq();
        if (res.success) {
          const formatted = res.data.map((loc: any) => ({
            label: `${loc.name} (${loc.code})`,
            value: loc.code,
          }));
          setLocations(formatted);
        }
      } catch (err) {
        console.log("Gagal narik lokasi:", err);
      }
    };
    fetchLocations();
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  const handleLogin = async () => {
    if (!phone || !password)
      return showToast("Isi dulu akun lu, jangan kosongan Bre!", "error");

    setLoading(true);
    try {
      const res = await loginReq(phone, password);

      // Biasanya strukturnya res.data.data (tergantung backend lu)
      // Sesuai controller lu, datanya ada di res.data.data
      const targetData = res.data?.data || res.data || res;

      if (targetData && targetData.token) {
        // Pastiin kirim user dan token yang bener
        await setAuth(targetData.user, targetData.token);
        showToast("Gaskeun! Lu udah masuk squad.", "success");
      } else {
        console.warn(
          "Token gak ketemu di response, strukturnya salah kali bre!",
        );
      }
    } catch (error: any) {
      console.error("LOGIN ERROR:", error);
      showToast(
        error.response?.data?.message || "Gagal masuk, cek lagi dah!",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (
      !username ||
      !password ||
      !fullname ||
      !phone ||
      !locationCode ||
      !role
    ) {
      return showToast("Lengkapin dulu datanya bgsd, biar gak ribet!", "error");
    }
    setLoading(true);
    try {
      await regiterReq({
        username,
        password,
        fullname,
        phone,
        locationCode,
        role,
      });
      showToast("Join Squad Berhasil! Login gih.", "success");
      setFormLogin(true);
    } catch (error: any) {
      showToast(
        error.response?.data?.message || "Gagal join, coba lagi Bre!",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const USER_ROLES = [
    "admin",
    "security",
    "cleaning_service",
    "customer_service",
    "gardener",
    "street",
  ] as const;

  // Filter dulu biar admin nggak muncul di pilihan register user biasa
  const roleOptions = USER_ROLES.filter((role) => role !== "admin").map(
    (role) => ({
      label: role.replace("_", " ").toUpperCase(), // Biar cantik: "CLEANING SERVICE"
      value: role,
    }),
  );

  return (
    <Container className="px-0">
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 60,
          }}>
          {/* Header Area */}
          <View className="items-center mb-10">
            <View className="w-24 h-24 bg-primary rounded-[32px] items-center justify-center shadow-2xl shadow-primary/40 rotate-3">
              {/* Icon yang masuk akal: Dompet/Cuan */}
              <Ionicons
                name={formLogin ? "wallet-outline" : "rocket-outline"}
                size={48}
                color="white"
              />
            </View>

            <Typography variant="h1" className="mt-8 text-center">
              {formLogin ? "Cuan Menantimu Bre!" : "Ready to Join Squad?"}
            </Typography>
            <Typography variant="caption" className="text-center mt-2 px-4">
              {formLogin
                ? "Login dulu biar mesin cuan lu nyala lagi. Let's GO! 🚀"
                : "Isi data lu, kita bikin standar kebersihan baru bareng-bareng."}
            </Typography>
          </View>

          {formLogin ? (
            /* --- FORM LOGIN --- */
            <View className="gap-y-4">
              <Input
                label="Nomor HP"
                placeholder="08123xxxx"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label="Password"
                placeholder="Jangan sampe lupa..."
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Button
                title="Gas Masuk"
                onPress={handleLogin}
                loading={loading}
                className="mt-4 py-4 bg-primary rounded-xl dark:bg-slate-500 text-slate-50"
              />
              <TouchableOpacity
                onPress={() => setFormLogin(false)}
                className="mt-6 flex-row justify-center">
                <Typography variant="caption">Baru di sini? </Typography>
                <Typography className="text-primary font-bold">
                  Join Squad Sekarang
                </Typography>
              </TouchableOpacity>
            </View>
          ) : (
            /* --- FORM REGISTER --- */
            <View className="gap-y-4">
              <Input
                label="Nama Lengkap"
                placeholder="Nama asli lu Bre"
                value={fullname}
                onChangeText={setFullname}
              />
              <Input
                label="Username"
                placeholder="Nickname squad"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
              <Input
                label="Nomor HP"
                placeholder="08123xxxx"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              {/* Dropdown Lokasi yang ngambil dari API */}
              <Dropdown
                label="Divisi Kerja"
                placeholder="Pilih Role lu..."
                options={roleOptions}
                value={role}
                onSelect={(val: any) => setRole(val.toString())}
              />

              <Dropdown
                label="Lokasi Kerja"
                placeholder="Pilih basecamp lu..."
                options={locations}
                value={locationCode}
                onSelect={(val: any) => setLocationCode(val.toString())}
              />

              <Input
                label="Password"
                placeholder="Bikin yang kuat kayak server"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <Button
                title="Daftar Squad"
                onPress={handleRegister}
                loading={loading}
                className="mt-4 py-4 bg-primary dark:bg-slate-50 rounded-xl"
              />
              <TouchableOpacity
                onPress={() => setFormLogin(true)}
                className="mt-6 flex-row justify-center">
                <Typography variant="caption">Udah punya akun? </Typography>
                <Typography className="text-primary font-bold">
                  Login Aja
                </Typography>
              </TouchableOpacity>
            </View>
          )}

          <Typography
            variant="caption"
            className="text-center mt-16 opacity-40 italic">
            Mapan Rajasa | Powered by Bre.Corp Uptime King 👑
          </Typography>
        </ScrollView>
      </KeyboardAvoidingView>
    </Container>
  );
};
