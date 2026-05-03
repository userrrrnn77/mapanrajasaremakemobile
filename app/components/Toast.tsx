import { View } from "react-native";
import { Typography } from "./Typography";
import { Ionicons } from "@expo/vector-icons";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  visible: boolean;
}

export const Toast = ({ message, type = "success", visible }: ToastProps) => {
  if (!visible) return null;

  const config = {
    success: { icon: "checkmark-circle", color: "bg-green-500" },
    error: { icon: "alert-circle", color: "bg-red-500" },
    info: { icon: "information-circle", color: "bg-blue-500" },
  };

  return (
    <View className="absolute top-12 left-4 right-4 z-50">
      <View
        className={`${config[type].color} flex-row items-center p-4 rounded-2xl shadow-lg`}>
        <Ionicons name={config[type].icon as any} size={24} color="white" />
        <Typography className="text-white ml-3 font-medium flex-1">
          {message}
        </Typography>
      </View>
    </View>
  );
};
