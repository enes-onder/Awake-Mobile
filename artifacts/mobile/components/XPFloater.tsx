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
}

export function XPFloater({ amount, visible, onDone }: XPFloaterProps) {
  const colors = useColors();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    if (visible) {
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
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animStyle]}>
      <Feather name="zap" size={14} color={colors.warning} />
      <Text style={[styles.text, { color: colors.warning }]}>+{amount} XP</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,149,0,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(255,149,0,0.5)",
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
