import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CelebrationOverlayProps {
  visible: boolean;
  isCorrect: boolean;
  message: string;
  subMessage?: string;
}

export function CelebrationOverlay({
  visible,
  isCorrect,
  message,
  subMessage,
}: CelebrationOverlayProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-80);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 12, stiffness: 200 });
      opacity.value = withTiming(1, { duration: 150 });
    } else {
      translateY.value = withTiming(-80, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  const color = isCorrect ? "#00C851" : "#FF3B30";
  const bg = isCorrect ? "rgba(0,200,81,0.18)" : "rgba(255,59,48,0.18)";

  return (
    <View style={[styles.overlay, { paddingTop: insets.top + 12, pointerEvents: "none" }]}>
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: bg, borderColor: color + "66" },
          animStyle,
        ]}
      >
        <Feather
          name={isCorrect ? "check-circle" : "x-circle"}
          size={20}
          color={color}
        />
        <View style={styles.textGroup}>
          <Text style={[styles.message, { color }]}>{message}</Text>
          {subMessage ? (
            <Text style={styles.subMessage}>{subMessage}</Text>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "flex-start",
    zIndex: 999,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    maxWidth: 320,
  },
  textGroup: {
    gap: 2,
  },
  message: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  subMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
  },
});
