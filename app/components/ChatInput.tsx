import { View, TextInput, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
    }
  };

  return (
    <View className="flex-row items-end p-4 bg-background border-t border-border">
      <View className="flex-1 bg-muted rounded-2xl px-4 py-2 mr-2">
        <TextInput
          multiline
          placeholder="Tanya AI sesuatu..."
          className="text-foreground text-base max-h-20"
          value={text}
          onChangeText={setText}
          placeholderTextColor="#94a3b8"
        />
      </View>
      <Pressable
        onPress={handleSend}
        disabled={disabled || !text.trim()}
        className={`w-12 h-12 rounded-full items-center justify-center ${!text.trim() ? "bg-muted" : "bg-primary"}`}>
        <Ionicons
          name="send"
          size={20}
          color={!text.trim() ? "#94a3b8" : "white"}
        />
      </Pressable>
    </View>
  );
};
