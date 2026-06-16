import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { styles } from "./labStyles";

interface LabTabButtonProps {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}

export function LabTabButton({ label, icon, active, onPress }: LabTabButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 8 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 8 });
  };
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { flex: 1 }]}>
      <TouchableOpacity
        style={[
          styles.tabBtn,
          active
            ? { backgroundColor: colors.primary, borderColor: colors.primary }
            : { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
      >
        <Feather
          name={icon as any}
          size={14}
          color={active ? "#fff" : colors.mutedForeground}
        />
        <Text
          style={[
            styles.tabBtnText,
            { color: active ? "#fff" : colors.mutedForeground },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
