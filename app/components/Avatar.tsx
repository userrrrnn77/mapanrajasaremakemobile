import { Image, View } from "react-native";
import { Typography } from "./Typography";

interface AvatarProps {
  uri?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export const Avatar = ({
  uri,
  name,
  size = "md",
  className = "",
}: AvatarProps) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
    "2xl": "w-40 h-40",
  };

  if (!name) return;

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <View
      className={`${sizes[size]} rounded-full bg-muted items-center justify-center overflow-hidden border border-border ${className}`}>
      {uri ? (
        <Image source={{ uri }} className="w-full h-full" />
      ) : (
        <Typography className="font-bold text-muted-foreground">
          {initials}
        </Typography>
      )}
    </View>
  );
};
