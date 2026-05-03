import { View } from "react-native";
import { Typography } from "./Typography";
import { Skeleton } from "./Skeleton"; // Pake skeleton yang udah kita bikin tadi

export const TypingIndicator = () => {
  return (
    <View className="flex-row justify-start mb-4 items-center">
      <View className="bg-muted p-4 rounded-2xl rounded-tl-none flex-row space-x-1">
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
        <Skeleton className="w-2 h-2 rounded-full" />
        <Typography variant="caption" className="ml-2">
          AI sedang mengetik...
        </Typography>
      </View>
    </View>
  );
};
