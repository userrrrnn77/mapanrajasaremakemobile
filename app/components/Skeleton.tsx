import { View, Animated } from "react-native";
import { useEffect, useRef } from "react";

export const Skeleton = ({ className = "" }: { className?: string }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={{ opacity }}
      className={`bg-muted rounded-lg ${className}`}
    />
  );
};
