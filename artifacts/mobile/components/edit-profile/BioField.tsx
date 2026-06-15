import React from "react";
import { Text, TextInput, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { SectionHeader } from "./SectionHeader";
import { styles } from "./styles";

interface BioFieldProps {
  value: string;
  onChangeText: (v: string) => void;
}

export function BioField({ value, onChangeText }: BioFieldProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(140).springify()} style={{ gap: 6, marginTop: 12 }}>
      <SectionHeader label="BİO" />

      <View
        style={[
          styles.inputWrap,
          styles.bioWrap,
          { backgroundColor: colors.secondary, borderColor: colors.border },
        ]}
      >
        <TextInput
          style={[styles.input, styles.bioInput, { color: colors.foreground }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Kendini birkaç kelimeyle tanıt…"
          placeholderTextColor={colors.mutedForeground}
          maxLength={80}
          multiline
          returnKeyType="done"
          blurOnSubmit
        />
      </View>

      <Text style={[styles.fieldHint, { color: colors.mutedForeground, textAlign: "right" }]}>
        {value.length}/80
      </Text>
    </Animated.View>
  );
}
