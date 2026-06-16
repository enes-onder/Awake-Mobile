import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";

import { styles } from "./styles";

interface AnonBannerProps {
  onPress: () => void;
}

export function AnonBanner({ onPress }: AnonBannerProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[
        styles.anonBanner,
        { backgroundColor: colors.warning + "14", borderColor: colors.warning + "44" },
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.anonIconBox, { backgroundColor: colors.warning + "22" }]}>
        <Feather name="user-x" size={18} color={colors.warning} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.anonTitle, { color: colors.foreground }]}>Misafir Hesabı</Text>
        <Text style={[styles.anonSub, { color: colors.mutedForeground }]}>
          İlerlemen kaybolabilir. Kalıcı hesap oluşturmak için dokun.
        </Text>
      </View>
      <Feather name="chevron-right" size={16} color={colors.warning} />
    </TouchableOpacity>
  );
}
