import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { simStyles } from "./simStyles";

interface SimTopBarProps {
  topPadding: number;
  progress: number;
  stepIdx: number;
  totalSteps: number;
  onClose: () => void;
}

export function SimTopBar({ topPadding, progress, stepIdx, totalSteps, onClose }: SimTopBarProps) {
  const colors = useColors();

  return (
    <View style={[simStyles.topBar, { paddingTop: topPadding + 14 }]}>
      <TouchableOpacity
        onPress={onClose}
        style={[simStyles.closeBtn, { backgroundColor: colors.secondary }]}
      >
        <Feather name="x" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      <View style={[simStyles.progressTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            simStyles.progressFill,
            { width: `${progress}%`, backgroundColor: colors.primary },
          ]}
        />
      </View>

      <Text style={[simStyles.stepLabel, { color: colors.mutedForeground }]}>
        {stepIdx + 1}/{totalSteps}
      </Text>
    </View>
  );
}
