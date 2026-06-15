import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { styles } from "./styles";

export function InfoCard() {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(260).springify()} style={{ marginTop: 16 }}>
      <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
        <Feather name="info" size={14} color={colors.mutedForeground} />
        <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
          Değişiklikler hemen kaydedilir ve tüm istatistiklerin korunur.
        </Text>
      </View>
    </Animated.View>
  );
}
