import {
  TextInput,
  View,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Typography } from "./Typography";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react-native";
import { useColorScheme } from "nativewind";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = ({
  label,
  error,
  className = "",
  secureTextEntry,
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { colorScheme } = useColorScheme();
  // Pastikan isDark beneran dapet state terbaru
  const isDark = colorScheme === "dark";

  return (
    <View className={`mb-4 w-full ${className}`}>
      {label && (
        <Typography
          variant="caption"
          className="mb-1 ml-1 text-slate-500 font-bold uppercase">
          {label}
        </Typography>
      )}

      <View
        className={`bg-white dark:bg-slate-900 border rounded-2xl px-4 flex-row items-center h-14 ${
          error
            ? "border-red-500"
            : isFocused
              ? "border-primary"
              : "border-slate-200 dark:border-slate-800"
        }`}>
        <TextInput
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={isDark ? "#94a3b8" : "#64748b"}
          style={{ textAlignVertical: "center" }}
          className="text-slate-900 dark:text-white text-base flex-1 h-full"
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            className="ml-2">
            {showPassword ? (
              <EyeOff size={20} color={isDark ? "#94a3b8" : "#64748b"} />
            ) : (
              <Eye size={20} color={isDark ? "#94a3b8" : "#64748b"} />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Typography variant="error" className="mt-1 ml-1 text-xs text-red-500">
          {error}
        </Typography>
      )}
    </View>
  );
};
