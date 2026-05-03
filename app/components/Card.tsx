import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  className?: string;
}

export const Card = ({ children, className = "", ...props }: CardProps) => {
  return (
    <View
      className={`bg-card p-4 rounded-2xl border border-border shadow-sm ${className}`}
      {...props}>
      {children}
    </View>
  );
};
