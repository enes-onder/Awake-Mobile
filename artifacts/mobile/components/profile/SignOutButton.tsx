import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

import { styles } from "./styles";

interface SignOutButtonProps {
  onSignOut: () => void;
  delay?: number;
}

export function SignOutButton({ onSignOut, delay = 380 }: SignOutButtonProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <TouchableOpacity
        style={[styles.signOutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={onSignOut}
        activeOpacity={0.75}
      >
        <Feather name="log-out" size={16} color={colors.fake} />
        <Text style={[styles.signOutText, { color: colors.fake }]}>Çıkış Yap</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
