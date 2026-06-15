import { Feather } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity } from "react-native";

import { useColors } from "@/hooks/useColors";

import { styles } from "./styles";

interface BackButtonProps {
  onPress: () => void;
}

export function BackButton({ onPress }: BackButtonProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.backBtn, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <Feather name="arrow-left" size={18} color={colors.foreground} />
    </TouchableOpacity>
  );
}
