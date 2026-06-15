import React from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";

interface GlowRingProps {
  color: string;
}

export function GlowRing({ color }: GlowRingProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(withSpring(1.15, { damping: 4 }), withSpring(1, { damping: 6 })),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 1200 }),
        withTiming(0.6, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        ringStyle,
        {
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: 60,
          borderWidth: 2,
          borderColor: color,
        },
      ]}
    />
  );
}
