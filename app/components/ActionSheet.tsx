import { View, TouchableOpacity, Modal, Pressable } from "react-native";
import { Typography } from "./Typography";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

// Ambil tipe "name" yang valid dari Ionicons
type IoniconsName = ComponentProps<typeof Ionicons>["name"];

interface ActionItem {
  label: string;
  icon: IoniconsName; // Pake tipe yang udah kita ambil tadi
  onPress: () => void;
  variant?: "default" | "danger";
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  actions: ActionItem[];
}

export const ActionSheet = ({
  visible,
  onClose,
  actions,
}: ActionSheetProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <View className="bg-card rounded-t-[32px] p-6 pb-12 border-t border-border">
          {/* Handle bar kecil di atas buat estetika */}
          <View className="w-12 h-1.5 bg-muted rounded-full self-center mb-6" />

          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                action.onPress();
                onClose();
              }}
              activeOpacity={0.7}
              className={`flex-row items-center py-4 ${
                index !== actions.length - 1 ? "border-b border-border" : ""
              }`}>
              <Ionicons
                name={action.icon}
                size={24}
                className={
                  action.variant === "danger"
                    ? "text-red-500"
                    : "text-foreground"
                }
              />
              <Typography
                className={`ml-4 font-medium ${
                  action.variant === "danger"
                    ? "text-red-500"
                    : "text-foreground"
                }`}>
                {action.label}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
};
