import { Feather } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

import { GlowRing } from "./GlowRing";
import { styles } from "./styles";

interface OnboardingLogoProps {
  delay?: number;
}

export function OnboardingLogo({ delay = 100 }: OnboardingLogoProps) {
  const colors = useColors();

  return (
    <View style={styles.logoArea}>
      <GlowRing color={colors.primary} />
      <Animated.View
        entering={FadeInDown.delay(delay).springify()}
        style={[styles.logoCircle, { backgroundColor: colors.primary + "22" }]}
      >
        <Feather name="shield" size={52} color={colors.primary} />
      </Animated.View>
    </View>
  );
}
