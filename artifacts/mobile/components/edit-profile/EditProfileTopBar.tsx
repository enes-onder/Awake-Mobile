import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { styles } from "./styles";

interface EditProfileTopBarProps {
  hasChanges: boolean;
  onBack: () => void;
  onSave: () => void;
}

export function EditProfileTopBar({ hasChanges, onBack, onSave }: EditProfileTopBarProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.topBar}>
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
        onPress={onBack}
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={18} color={colors.foreground} />
      </TouchableOpacity>

      <Text style={[styles.pageTitle, { color: colors.foreground }]}>
        Profili Düzenle
      </Text>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: hasChanges ? colors.primary : colors.secondary }]}
        onPress={onSave}
        activeOpacity={0.8}
        disabled={!hasChanges}
      >
        <Text style={[styles.saveBtnText, { color: hasChanges ? "#fff" : colors.mutedForeground }]}>
          Kaydet
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
