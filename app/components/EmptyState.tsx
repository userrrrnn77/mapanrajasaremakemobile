import { View } from "react-native";
import { Typography } from "./Typography";
import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  // Ini cara yang bener buat ambil tipe nama icon dari Ionicons
  icon?: ComponentProps<typeof Ionicons>["name"];
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon = "document-text-outline",
  className = "",
}: EmptyStateProps) => {
  return (
    <View className={`flex-1 items-center justify-center p-8 ${className}`}>
      <Ionicons
        name={icon}
        size={64}
        className="text-muted-foreground opacity-20"
      />
      <Typography variant="h2" className="mt-4 text-center">
        {title}
      </Typography>
      {description && (
        <Typography
          variant="caption"
          className="mt-2 text-center text-muted-foreground">
          {description}
        </Typography>
      )}
    </View>
  );
};
