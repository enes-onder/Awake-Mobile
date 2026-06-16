import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

import { styles } from "./styles";

interface ProfileHeaderProps {
  onEditPress: () => void;
}

export function ProfileHeader({ onEditPress }: ProfileHeaderProps) {
  const colors = useColors();
  const r = useResponsive();

  return (
    <View style={styles.headerRow}>
      <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: r.fs(28) }]}>
        Profil
      </Text>
      <TouchableOpacity
        style={[styles.editBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
        onPress={onEditPress}
        activeOpacity={0.7}
      >
        <Feather name="edit-2" size={14} color={colors.foreground} />
        <Text style={[styles.editBtnText, { color: colors.foreground }]}>Düzenle</Text>
      </TouchableOpacity>
    </View>
  );
}
