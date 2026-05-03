import { RefreshControl as RNRefreshControl } from "react-native";

export const Refresh = ({
  refreshing,
  onRefresh,
}: {
  refreshing: boolean;
  onRefresh: () => void;
}) => (
  <RNRefreshControl
    refreshing={refreshing}
    onRefresh={onRefresh}
    tintColor="#your-primary-color" // Sesuaikan dengan warna brand lu
    colors={["#your-primary-color"]}
  />
);
