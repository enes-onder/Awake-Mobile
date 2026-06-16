import { Feather } from "@expo/vector-icons";
import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
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
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 14, stiffness: 180 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(-100, { duration: 250 });
      opacity.value = withTiming(0, { duration: 250 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const color = isCorrect ? "#00C851" : "#FF3B30";
  const bg = isCorrect ? "rgba(0,200,81,0.18)" : "rgba(255,59,48,0.18)";

  const topPad =
    Platform.OS === "web"
      ? Math.max(insets.top, 67) + 16
      : insets.top + 20;

  return (
    <View
      style={[styles.overlay, { pointerEvents: "none" }]}
    >
      <Animated.View
        style={[
          styles.toastWrapper,
          { paddingTop: topPad },
          animStyle,
        ]}
      >
        <View
          style={[
            styles.toast,
            { backgroundColor: bg, borderColor: color + "88" },
          ]}
        >
          <Feather
            name={isCorrect ? "check-circle" : "x-circle"}
            size={22}
            color={color}
          />
          <View style={styles.textGroup}>
            <Text style={[styles.message, { color }]}>{message}</Text>
            {subMessage ? (
              <Text style={styles.subMessage}>{subMessage}</Text>
            ) : null}
          </View>
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
  toastWrapper: {
    alignItems: "center",
    width: "100%",
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1.5,
    maxWidth: 340,
    ...Platform.select({
      web: { boxShadow: "0 4px 20px rgba(0,0,0,0.4)" } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
      },
    }),
  },
  textGroup: {
    gap: 3,
  },
  message: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
  },
  subMessage: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
  },
});
