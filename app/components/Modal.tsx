import {
  Modal as RNModal,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Typography } from "./Typography";
import { Ionicons } from "@expo/vector-icons";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ visible, onClose, title, children }: ModalProps) => {
  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/60 justify-end" onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          // Kasih behavior undefined di Android biar gak mental-mental
          className="w-full">
          <Pressable
            onPress={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-800 rounded-t-[40px] border-t border-slate-100 dark:border-slate-700 shadow-2xl max-h-[85vh]">
            {/* Handle Bar */}
            <View className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full self-center mt-3 mb-2" />

            <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
              <Typography
                variant="h2"
                className="text-slate-900 dark:text-white">
                {title}
              </Typography>
              <TouchableOpacity
                onPress={onClose}
                className="bg-slate-100 dark:bg-slate-700 p-2 rounded-full">
                <Ionicons
                  name="close"
                  size={20}
                  className="text-slate-600 dark:text-slate-300"
                />
              </TouchableOpacity>
            </View>

            {/* ScrollView dibenerin logic-nya */}
            <ScrollView
              className="px-6"
              contentContainerStyle={{ paddingBottom: 100 }} // Kasih padding gede biar bisa di-scroll sampe paling bawah
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              // Biar pas scroll gak langsung nutup keyboard
            >
              <View className="mt-4">{children}</View>
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </RNModal>
  );
};
