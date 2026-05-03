import {
  TextInput,
  View,
  TextInputProps,
  TouchableOpacity,
} from "react-native";
import { Typography } from "./Typography";
import { useState } from "react";
// Lu bisa pake Lucide atau icon lain, ini contoh pake Lucide
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  className?: string;
}

export const Input = ({
  label,
  error,
  className = "",
  secureTextEntry, // Kita ambil dari props asli TextInput
  ...props
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  // State buat toggle mata
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className={`mb-4 w-full ${className}`}>
      {label && (
        <Typography variant="caption" className="mb-1 ml-1 text-slate-500">
          {label}
        </Typography>
      )}

      {/* Container dibikin flex-row biar icon bisa di samping kanan */}
      <View
        className={`bg-card border rounded-xl px-4 py-3 flex-row items-center ${
          error
            ? "border-red-500"
            : isFocused
              ? "border-primary"
              : "border-border"
        }`}>
        <TextInput
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="#94a3b8"
          className="text-foreground text-base p-0 flex-1" // flex-1 biar gak nabrak icon
          // Logic: kalau aslinya password, biarin dia ikut toggle showPassword
          secureTextEntry={secureTextEntry && !showPassword}
          {...props}
        />

        {/* Cuma muncul kalau props secureTextEntry dikirim */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
            className="ml-2">
            {showPassword ? (
              <EyeOff size={20} color="#94a3b8" />
            ) : (
              <Eye size={20} color="#94a3b8" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Typography variant="error" className="mt-1 ml-1">
          {error}
        </Typography>
      )}
    </View>
  );
};
