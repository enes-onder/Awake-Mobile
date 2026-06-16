import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { Simulation } from "@/data/simulations";
import { simStyles } from "./simStyles";

interface SimDoneScreenProps {
  simulation: Simulation;
  totalXP: number;
  topPadding: number;
  onExit: () => void;
}

export function SimDoneScreen({ simulation, totalXP, topPadding, onExit }: SimDoneScreenProps) {
  const colors = useColors();

  return (
    <View style={[simStyles.container, { paddingTop: topPadding }]}>
      <View style={simStyles.doneContainer}>
        <Animated.View entering={ZoomIn.springify()} style={[simStyles.doneIconBox, { backgroundColor: colors.success + "20" }]}>
          <Feather name="award" size={48} color={colors.success} />
        </Animated.View>

        <Animated.View entering={FadeIn.delay(200)} style={{ alignItems: "center", gap: 8 }}>
          <Text style={[simStyles.doneTitle, { color: colors.foreground }]}>
            Simülasyon Tamamlandı!
          </Text>
          <Text style={[simStyles.doneDesc, { color: colors.mutedForeground }]}>
            {simulation.description}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(400)} style={{ alignItems: "center" }}>
          <Text style={[simStyles.doneXP, { color: colors.warning }]}>+{totalXP}</Text>
          <Text style={[simStyles.doneXPLabel, { color: colors.mutedForeground }]}>XP Kazandın</Text>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(600)}>
          <TouchableOpacity
            onPress={onExit}
            style={[simStyles.doneCloseBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={simStyles.doneCloseBtnText}>Tamam</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}
