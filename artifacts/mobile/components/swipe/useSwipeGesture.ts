import { useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { SWIPE_THRESHOLD } from "./swipeConstants";

interface UseSwipeGestureProps {
  width: number;
  onVerdictSelected: (verdict: "real" | "fake") => void;
}

export function useSwipeGesture({ width, onVerdictSelected }: UseSwipeGestureProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const [swiping, setSwiping] = useState<"real" | "fake" | null>(null);
  const [verdictLocked, setVerdictLocked] = useState<"real" | "fake" | null>(null);
  const verdictLockedRef = useRef(false);

  const xpPenaltyOpacity = useSharedValue(0);
  const xpPenaltyTranslateY = useSharedValue(0);

  const xpPenaltyAnimStyle = useAnimatedStyle(() => ({
    opacity: xpPenaltyOpacity.value,
    transform: [{ translateY: xpPenaltyTranslateY.value }],
  }));

  const showXPPenalty = () => {
    xpPenaltyTranslateY.value = 0;
    xpPenaltyOpacity.value = withSequence(
      withTiming(1, { duration: 120 }),
      withTiming(1, { duration: 900 }),
      withTiming(0, { duration: 280 })
    );
    xpPenaltyTranslateY.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(-28, { duration: 1300 })
    );
  };

  const triggerVerdict = (verdict: "real" | "fake") => {
    if (verdictLockedRef.current) return;
    verdictLockedRef.current = true;
    setVerdictLocked(verdict);
    setSwiping(null);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    const toX = verdict === "real" ? width + 100 : -(width + 100);
    Animated.timing(pan, {
      toValue: { x: toX, y: -60 },
      duration: 350,
      useNativeDriver: false,
    }).start(() => {
      onVerdictSelected(verdict);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !verdictLockedRef.current,
      onMoveShouldSetPanResponder: (_, gs) =>
        !verdictLockedRef.current && Math.abs(gs.dx) > 5,
      onPanResponderMove: (_, gs) => {
        if (verdictLockedRef.current) return;
        pan.setValue({ x: gs.dx, y: gs.dy * 0.2 });
        if (gs.dx > 40) setSwiping("real");
        else if (gs.dx < -40) setSwiping("fake");
        else setSwiping(null);
      },
      onPanResponderRelease: (_, gs) => {
        if (verdictLockedRef.current) return;
        setSwiping(null);

        const isFlickRight = gs.vx > 0.35 && gs.dx > 10;
        const isFlickLeft = gs.vx < -0.35 && gs.dx < -10;

        if (gs.dx > SWIPE_THRESHOLD || isFlickRight) {
          triggerVerdict("real");
        } else if (gs.dx < -SWIPE_THRESHOLD || isFlickLeft) {
          triggerVerdict("fake");
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 7,
            tension: 80,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-14deg", "0deg", "14deg"],
    extrapolate: "clamp",
  });

  const realOpacity = pan.x.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const fakeOpacity = pan.x.interpolate({
    inputRange: [-60, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  return {
    pan,
    swiping,
    verdictLocked,
    panResponder,
    rotate,
    realOpacity,
    fakeOpacity,
    triggerVerdict,
    showXPPenalty,
    xpPenaltyAnimStyle,
  };
}
