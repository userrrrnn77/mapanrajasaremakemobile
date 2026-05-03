import React from "react";
import { View, TouchableOpacity, Alert } from "react-native";
import Markdown from "react-native-markdown-display";
import * as Clipboard from "expo-clipboard";
import { Typography } from "./Typography";

interface ChatBubbleProps {
  message: string;
  isAi?: boolean;
  time?: string;
}

export const ChatBubble = ({
  message,
  isAi = false,
  time,
}: ChatBubbleProps) => {
  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(message);
    Alert.alert("Berhasil", "Pesan disalin ke clipboard");
  };

  return (
    <View className={`mb-4 flex-row ${isAi ? "justify-start" : "justify-end"}`}>
      <TouchableOpacity
        onLongPress={copyToClipboard}
        delayLongPress={500}
        activeOpacity={0.8} // Sekarang prop ini legal Bre
        className={`max-w-[85%] p-4 rounded-2xl ${
          isAi
            ? "bg-muted rounded-tl-none border border-border"
            : "bg-primary rounded-tr-none"
        }`}>
        {isAi ? (
          <Markdown
            style={{
              body: {
                color: "#0f172a",
                fontSize: 15,
                lineHeight: 22,
              },
              paragraph: {
                marginBottom: 12,
                marginTop: 0,
              },
              bullet_list: { marginBottom: 10 },
              ordered_list: { marginBottom: 10 },
              strong: { fontWeight: "bold" },
              em: { fontStyle: "italic" },
              code_inline: {
                backgroundColor: "#f1f5f9",
                padding: 2,
                borderRadius: 4,
                fontFamily: "monospace",
              },
            }}>
            {message}
          </Markdown>
        ) : (
          <Typography className="text-white">{message}</Typography>
        )}

        {time && (
          <Typography
            variant="caption"
            className={`text-[10px] mt-1 opacity-60 ${
              isAi ? "text-slate-500" : "text-white"
            }`}>
            {time}
          </Typography>
        )}
      </TouchableOpacity>
    </View>
  );
};
