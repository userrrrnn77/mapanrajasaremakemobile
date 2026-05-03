import { View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
interface ContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  className?: string;
}

export const Container = ({
  children,
  scrollable = false,
  className = "",
}: ContainerProps) => {
  const Content = scrollable ? ScrollView : View;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <Content
        className={`flex-1 px-4 ${className}`}
        showsVerticalScrollIndicator={false}>
        {children}
      </Content>
    </SafeAreaView>
  );
};
