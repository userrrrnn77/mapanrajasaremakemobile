import { View } from "react-native";

export const Divider = ({ className = "" }: { className?: string }) => (
  <View className={`h-[1px] bg-border w-full ${className}`} />
);
