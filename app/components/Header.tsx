import React from "react";
import { View, Pressable } from "react-native";
import { Typography } from "./Typography";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  unreadCount?: number;
}

export const Header = ({
  title,
  showBack,
  onBack,
  rightElement,
  unreadCount = 0,
}: HeaderProps) => {
  const navigation = useNavigation();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Logic: Kalo ada onBack custom dipake, kalo gak ada ya goBack standar
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View className="flex-row items-center justify-between px-6 py-4 bg-white dark:text-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
      <View className="flex-row items-center flex-1">
        {showBack && (
          <Pressable
            onPress={handleBack}
            className="mr-3 p-1 -ml-1 active:opacity-50 dark:text-white">
            <Ionicons
              name="chevron-back"
              size={28}
              color={isDark ? "#ffffff" : "#0f172a"}
            />
          </Pressable>
        )}
        <Typography
          variant="h2"
          className="flex-1 font-bold dark:text-white"
          numberOfLines={1}>
          {title}
        </Typography>
      </View>

      {/* Sisi Kanan: Bisa custom element (icon settings/save) atau default notif */}
      <View className="flex-row items-center">
        {rightElement
          ? rightElement
          : unreadCount > 0 && (
              <View className="relative p-1">
                <Ionicons
                  name="notifications-outline"
                  size={26}
                  className="text-slate-900 dark:text-white"
                />
                <View className="absolute top-0 right-0 bg-red-500 w-4 h-4 rounded-full items-center justify-center border-2 border-white dark:border-slate-800">
                  <Typography className="text-[8px] text-white font-black">
                    {unreadCount}
                  </Typography>
                </View>
              </View>
            )}
      </View>
    </View>
  );
};
