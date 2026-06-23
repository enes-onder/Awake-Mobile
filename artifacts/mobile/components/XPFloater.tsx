import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface XPFloaterProps {
  amount: number;
  visible: boolean;
  onDone: () => void;
  /** XPFloater'ın ekranın altından uzaklığı (px). Varsayılan: 140. */
  bottomOffset?: number;
}

export function XPFloater({ amount, visible, onDone, bottomOffset }: XPFloaterProps) {
  const colors = useColors();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.5);

  /** Negatif XP için kırmızı, pozitif için amber/warning */
  const isNegative = amount < 0;
  const toneColor = isNegative ? colors.fake : colors.warning;
  const bgColor = isNegative ? colors.fake + "18" : colors.warning + "18";
  const borderColor = isNegative ? colors.fake + "55" : colors.warning + "55";

  /** amount değişince de re-tetikle — aynı visible=true iken ipucu/karar sıralaması için */
  useEffect(() => {
    if (!visible) return;

    opacity.value = 0;
    translateY.value = 0;
    scale.value = 0.5;

    opacity.value = withSequence(
      withSpring(1, { damping: 8 }),
      withDelay(
        300,
        withTiming(0, { duration: 200 }, (finished) => {
          if (finished) runOnJS(onDone)();
        }),
      ),
    );
    scale.value = withSpring(1, { damping: 6, stiffness: 200 });
    translateY.value = withSequence(
      withSpring(-8, { damping: 8 }),
      withDelay(200, withTiming(-40, { duration: 300 })),
    );
  }, [visible, amount]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  /** bottomOffset yoksa güvenli varsayılan */
  const safeBottom = bottomOffset ?? 140;

  /** visible=false iken mount tutulur ama opacity 0'da — return null ile animasyon sıfırlanmaz */
  if (!visible && opacity.value === 0) return null;

  /** +35 XP veya -14 XP formatı — asla +-14 XP yazmamalı */
  const formattedAmount = `${amount > 0 ? "+" : ""}${amount} XP`;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: safeBottom,
          backgroundColor: bgColor,
          borderColor,
        },
        animStyle,
      ]}
    >
      <Feather name="zap" size={14} color={toneColor} />
      <Text style={[styles.text, { color: toneColor }]}>{formattedAmount}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    zIndex: 100,
  },
  text: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
});
