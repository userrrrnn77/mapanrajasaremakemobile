import { Text, TextProps } from "react-native";

interface TypographyProps extends TextProps {
  variant?: "h1" | "h2" | "body" | "h3" | "caption" | "error";
  className?: string; // Tambahin ini biar TS diem
}

export const Typography = ({
  variant = "body",
  className = "",
  ...props
}: TypographyProps) => {
  const variants = {
    h1: "text-3xl font-bold text-foreground",
    h2: "text-xl font-semibold text-foreground",
    h3: "text-lg font-semibold text-foreground",
    body: "text-base text-foreground",
    caption: "text-sm text-muted-foreground",
    error: "text-sm text-red-500",
  };

  return <Text className={`${variants[variant]} ${className}`} {...props} />;
};
