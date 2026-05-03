import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
} from "react-native";
import { Typography } from "./Typography";
import { Ionicons } from "@expo/vector-icons";

interface Option {
  label: string;
  value: string | number;
}

interface DropdownProps {
  label?: string;
  options: Option[];
  value: string | number;
  onSelect: (value: string | number) => void;
  placeholder?: string;
  error?: string;
}

export const Dropdown = ({
  label,
  options,
  value,
  onSelect,
  placeholder = "Pilih opsi...",
  error,
}: DropdownProps) => {
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="mb-4">
      {label && (
        <Typography className="mb-2 font-semibold text-sm">{label}</Typography>
      )}

      <TouchableOpacity
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        className={`flex-row items-center justify-between p-4 bg-muted/50 rounded-2xl border ${error ? "border-red-500" : "border-border"}`}>
        <Typography
          className={
            selectedOption ? "text-foreground" : "text-muted-foreground"
          }>
          {selectedOption ? selectedOption.label : placeholder}
        </Typography>
        <Ionicons name="chevron-down" size={20} color="#64748b" />
      </TouchableOpacity>

      {error && (
        <Typography className="text-red-500 text-xs mt-1 ml-1">
          {error}
        </Typography>
      )}

      {/* Pop-up Opsi */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}>
        <Pressable
          className="flex-1 bg-black/40 justify-end"
          onPress={() => setVisible(false)}>
          <View className="bg-card rounded-t-[32px] p-6 pb-12 max-h-[50%]">
            <View className="w-12 h-1.5 bg-muted rounded-full self-center mb-6" />
            <Typography variant="h3" className="mb-4 text-center">
              Pilih {label}
            </Typography>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                  className={`py-4 border-b border-border flex-row justify-between items-center`}>
                  <Typography
                    className={
                      item.value === value
                        ? "text-primary font-bold"
                        : "text-foreground"
                    }>
                    {item.label}
                  </Typography>
                  {item.value === value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#your-primary-color"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};
