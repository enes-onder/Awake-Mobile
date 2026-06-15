import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { SectionHeader } from "./SectionHeader";
import { styles } from "./styles";

interface UsernameFieldProps {
  value: string;
  onChangeText: (v: string) => void;
  canChangeName: boolean;
  daysLeft: number;
  onLockedFocus: () => void;
}

export function UsernameField({
  value,
  onChangeText,
  canChangeName,
  daysLeft,
  onLockedFocus,
}: UsernameFieldProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(80).springify()} style={{ gap: 6 }}>
      <SectionHeader label="KOD ADI" />

      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.secondary,
            borderColor: canChangeName ? colors.border : colors.border + "66",
          },
        ]}
      >
        <Feather
          name="user"
          size={16}
          color={canChangeName ? colors.primary : colors.mutedForeground}
          style={{ marginLeft: 14 }}
        />
        <TextInput
          style={[styles.input, { color: canChangeName ? colors.foreground : colors.mutedForeground }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Kod adın"
          placeholderTextColor={colors.mutedForeground}
          maxLength={18}
          returnKeyType="done"
          editable={canChangeName}
          onFocus={() => { if (!canChangeName) onLockedFocus(); }}
        />
        {!canChangeName && (
          <View style={[styles.lockBadge, { backgroundColor: colors.border }]}>
            <Feather name="lock" size={12} color={colors.mutedForeground} />
          </View>
        )}
      </View>

      {canChangeName ? (
        <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
          Kod adını ayda 1 kez değiştirebilirsin.
        </Text>
      ) : (
        <View style={[styles.warningRow, { backgroundColor: colors.warning + "14", borderColor: colors.warning + "33" }]}>
          <Feather name="clock" size={13} color={colors.warning} />
          <Text style={[styles.warningText, { color: colors.warning }]}>
            {daysLeft} gün sonra tekrar değiştirebilirsin
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
