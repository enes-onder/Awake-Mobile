import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { styles } from "./homeStyles";

interface StreakBonusToastProps {
  xp: number;
  onDone: () => void;
}

export function StreakBonusToast({ xp, onDone }: StreakBonusToastProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 350 }),
      withTiming(1, { duration: 2200 }),
      withTiming(0, { duration: 500 })
    );
    translateY.value = withSequence(
      withSpring(0, { damping: 14 }),
      withTiming(0, { duration: 2200 }),
      withTiming(-20, { duration: 500 })
    );
    const timer = setTimeout(onDone, 3100);
    return () => clearTimeout(timer);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[styles.toastContainer, animStyle]}>
      <View style={[styles.toast, { backgroundColor: "#FF6B35", shadowColor: "#FF6B35" }]}>
        <Text style={styles.toastEmoji}>🔥</Text>
        <Text style={styles.toastText}>Günlük Seri Bonusu! +{xp} XP</Text>
      </View>
    </Animated.View>
  );
}
