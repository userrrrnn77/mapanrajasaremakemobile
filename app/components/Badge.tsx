import { View } from "react-native";
import { Typography } from "./Typography";

interface BadgeProps {
  label: string;
  variant?: "success" | "warning" | "error" | "info";
  className?: string;
}

export const Badge = ({
  label,
  variant = "info",
  className = "",
}: BadgeProps) => {
  const styles = {
    success:
      "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    warning:
      "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    error: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    info: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  };

  return (
    <View
      className={`px-2.5 py-0.5 rounded-full self-start ${styles[variant].split(" ").slice(0, 2).join(" ")} ${className}`}>
      <Typography
        className={`text-xs font-medium ${styles[variant].split(" ").slice(2).join(" ")}`}>
        {label}
      </Typography>
    </View>
  );
};
