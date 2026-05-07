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
import { getAllActivityReq } from "../../api/activity";
import { useTheme } from "../../context/useThemeStore";

interface IActivityFE {
  _id: string;
  user: {
    fullname: string;
    phone: string;
  };
  title: string;
  address: string;
  documentation: {
    photo: { url: string };
    caption: string;
  }[];
  createdAt: string;
}

const ManajemenAktivitas = () => {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<IActivityFE[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState<IActivityFE | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const res = await getAllActivityReq();
      if (res.data.success) {
        setActivities(res.data.data);
      }
    } catch (err) {
      console.error("Gagal tarik aktivitas:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const renderItem = ({ item }: { item: IActivityFE }) => (
    <View className="flex-row mb-8">
      {/* Timeline Line & Indicator */}
      <View className="items-center mr-4">
        <View className="bg-primary p-2 rounded-full shadow-lg shadow-primary/40 z-10">
          <Ionicons name="flash" size={16} color="white" />
        </View>
        <View className="flex-1 w-[2px] bg-slate-200 dark:bg-slate-800 mt-2" />
      </View>

      {/* Content Card */}
      <TouchableOpacity
        onPress={() => {
          setSelectedActivity(item);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
        className="flex-1 bg-white dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm shadow-slate-200 dark:shadow-none">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-2">
            <Typography
              variant="h3"
              className="text-slate-900 dark:text-white leading-6">
              {item.title}
            </Typography>
            <Typography className="text-primary font-bold text-[10px] mt-1 uppercase tracking-widest">
              BY: {item.user?.fullname || "Karyawan"}
            </Typography>
          </View>
          <Typography className="text-slate-400 dark:text-slate-500 text-[10px] font-bold">
            {new Date(item.createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Typography>
        </View>

        <View className="flex-row items-center mb-4">
          <Ionicons name="location-sharp" size={12} color="#64748b" />
          <Typography
            className="text-slate-500 dark:text-slate-400 text-[11px] ml-1 flex-1"
            numberOfLines={1}>
            {item.address}
          </Typography>
        </View>

        {item.documentation && item.documentation.length > 0 && (
          <View className="rounded-[24px] overflow-hidden">
            <Image
              source={{ uri: item.documentation[0].photo.url }}
              className="w-full h-44 bg-slate-100 dark:bg-slate-800"
              resizeMode="cover"
            />
            {item.documentation.length > 1 && (
              <View className="absolute top-3 right-3 bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                <Typography className="text-white text-[10px] font-black">
                  +{item.documentation.length - 1} FOTO
                </Typography>
              </View>
            )}
            <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <Typography
                className="text-white text-xs italic"
                numberOfLines={1}>
                "{item.documentation[0].caption}"
              </Typography>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Container className="px-0 bg-slate-50 dark:bg-slate-950">
      <Header title="Pantau Aktivitas" showBack />

      <View className="flex-1 px-5 pt-6">
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0099ff" />
            <Typography className="mt-4 text-slate-400 animate-pulse tracking-widest text-[10px] font-bold">
              MENYINKRONKAN DATA...
            </Typography>
          </View>
        ) : (
          <FlatList
            data={activities}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#0099ff"
              />
            }
            ListHeaderComponent={
              <View className="mb-6">
                <Typography
                  variant="h2"
                  className="text-slate-900 dark:text-white">
                  Live Feed
                </Typography>
                <Typography className="text-slate-400 text-xs">
                  Pantau pergerakan pasukan di lapangan Bre.
                </Typography>
              </View>
            }
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center mt-32">
                <Ionicons
                  name="cafe-outline"
                  size={64}
                  color={isDark ? "#1e293b" : "#e2e8f0"}
                />
                <Typography className="text-slate-400 mt-4 font-bold">
                  Belum ada aktivitas hari ini.
                </Typography>
              </View>
            }
          />
        )}
      </View>

      {/* MODAL DETAIL AKTIVITAS */}
      <Modal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Detail Kegiatan">
        {selectedActivity && (
          <View className="pb-10">
            <View className="bg-slate-50 dark:bg-slate-900 p-5 rounded-[32px] border border-slate-100 dark:border-slate-800 mb-6">
              <Typography className="text-primary font-black text-[10px] mb-2 uppercase tracking-[3px]">
                DILAPORKAN OLEH
              </Typography>
              <Typography
                variant="h2"
                className="text-slate-900 dark:text-white mb-1">
                {selectedActivity.user.fullname}
              </Typography>
              <Typography className="text-slate-400 text-xs">
                {selectedActivity.user.phone}
              </Typography>
            </View>

            <Typography
              variant="h3"
              className="text-slate-800 dark:text-white mb-2">
              {selectedActivity.title}
            </Typography>
            <View className="flex-row items-center mb-6">
              <Ionicons name="time-outline" size={14} color="#0099ff" />
              <Typography className="text-primary text-xs ml-1 font-bold">
                {new Date(selectedActivity.createdAt).toLocaleString("id-ID")}
              </Typography>
            </View>

            <Typography className="text-slate-400 font-bold text-[10px] mb-4 uppercase tracking-widest">
              GALERI DOKUMENTASI
            </Typography>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="flex-row mb-8">
              {selectedActivity.documentation.map((doc, index) => (
                <View key={index} className="mr-4 items-center">
                  <View className="rounded-[32px] overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl shadow-black/20">
                    <Image
                      source={{ uri: doc.photo.url }}
                      className="w-72 h-80 bg-slate-200 dark:bg-slate-800"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl -mt-6 border border-slate-100 dark:border-slate-700 shadow-sm w-[80%]">
                    <Typography className="text-slate-600 dark:text-slate-300 text-center text-[11px] italic">
                      "{doc.caption}"
                    </Typography>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-[28px] flex-row items-start mb-8">
              <Ionicons name="navigate-circle" size={24} color="#0099ff" />
              <View className="ml-3 flex-1">
                <Typography className="text-blue-900 dark:text-blue-300 font-bold text-sm">
                  Titik Koordinat
                </Typography>
                <Typography className="text-blue-700/60 dark:text-blue-400/60 text-xs mt-1">
                  {selectedActivity.address}
                </Typography>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              activeOpacity={0.8}
              className="bg-primary p-5 rounded-[24px] items-center shadow-xl shadow-primary/40">
              <Typography className="text-white font-bold text-lg">
                Tutup Pantauan
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </Container>
  );
};

export default ManajemenAktivitas;
