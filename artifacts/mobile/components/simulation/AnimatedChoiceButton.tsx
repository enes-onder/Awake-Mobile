import React, { useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { SimChoice } from "@/data/simulations";
import { simStyles } from "./simStyles";

interface AnimatedChoiceButtonProps {
  choice: SimChoice;
  index: number;
  selected: boolean;
  answered: boolean;
  onPress: (id: string) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export function AnimatedChoiceButton({
  choice,
  index,
  selected,
  answered,
  onPress,
}: AnimatedChoiceButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(0.9);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = index * 90;
    const t1 = setTimeout(() => {
      scale.value = withSpring(1, { damping: 12 });
      opacity.value = withTiming(1, { duration: 250 });
    }, delay);
    return () => clearTimeout(t1);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const getBorderColor = () => {
    if (!answered) return selected ? colors.primary : colors.border;
    if (selected && choice.isCorrect) return colors.success;
    if (selected && !choice.isCorrect) return colors.fake;
    if (!selected && choice.isCorrect) return colors.success + "88";
    return colors.border;
  };

  const getBg = () => {
    if (!answered) return selected ? colors.primary + "18" : colors.card;
    if (selected && choice.isCorrect) return colors.success + "18";
    if (selected && !choice.isCorrect) return colors.fake + "18";
    if (!selected && choice.isCorrect) return colors.success + "0C";
    return colors.card;
  };

  return (
    <AnimatedTouchable
      style={[simStyles.choiceBtn, animStyle, { backgroundColor: getBg(), borderColor: getBorderColor() }]}
      onPress={() => !answered && onPress(choice.id)}
      disabled={answered}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`Seçenek ${index + 1}: ${choice.text}`}
      accessibilityHint="Bu seçeneği simülasyon cevabı olarak seçer"
      accessibilityState={{ selected, disabled: answered }}
    >
      <Text
        style={[
          simStyles.choiceLabel,
          {
            color: answered && choice.isCorrect
              ? colors.success
              : answered && selected && !choice.isCorrect
              ? colors.fake
              : colors.foreground,
          },
        ]}
      >
        {choice.text}
      </Text>
      {answered && choice.isCorrect && (
        <Text style={[simStyles.choiceOutcome, { color: colors.success }]}>
          ✓ Doğru seçim
        </Text>
      )}
      {answered && selected && !choice.isCorrect && (
        <Text style={[simStyles.choiceOutcome, { color: colors.fake }]}>
          ✗ Yanlış seçim
        </Text>
      )}
    </AnimatedTouchable>
  );
}
