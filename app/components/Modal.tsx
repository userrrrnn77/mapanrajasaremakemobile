import {
  Modal as RNModal,
  View,
  Pressable,
  TouchableWithoutFeedback,
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
      <Pressable className="flex-1 bg-black/50 justify-end" onPress={onClose}>
        <TouchableWithoutFeedback>
          <View className="bg-card rounded-t-[32px] p-6 pb-10 border-t border-border">
            <View className="flex-row justify-between items-center mb-6">
              <Typography variant="h2">{title}</Typography>
              <Pressable
                onPress={onClose}
                className="bg-muted p-1 rounded-full">
                <Ionicons name="close" size={20} className="text-foreground" />
              </Pressable>
            </View>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
    </RNModal>
  );
};
