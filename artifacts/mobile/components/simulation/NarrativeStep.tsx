import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";
import type { Simulation } from "@/data/simulations";
import { simStyles } from "./simStyles";

interface NarrativeStepProps {
  step: Simulation["steps"][number];
  stepIdx: number;
}

export function NarrativeStep({ step, stepIdx }: NarrativeStepProps) {
  const colors = useColors();
  const r = useResponsive();

  return (
    <Animated.View
      key={`narrative-${stepIdx}`}
      entering={FadeInDown.springify()}
      style={[
        simStyles.narrativeCard,
        {
          backgroundColor: colors.primary + "12",
          borderColor: colors.primary + "33",
          padding: r.sp(22),
          borderRadius: r.sp(20),
        },
      ]}
    >
      <View
        style={[
          simStyles.narrativeIcon,
          {
            width: r.sp(44),
            height: r.sp(44),
            borderRadius: r.sp(22),
            backgroundColor: "rgba(43,127,255,0.12)",
          },
        ]}
      >
        <Feather name="message-circle" size={r.sp(22)} color={colors.primary} />
      </View>
      <Text
        style={[
          simStyles.narrativeText,
          { color: colors.foreground, fontSize: r.fs(16), lineHeight: r.fs(26) },
        ]}
      >
        {step.text}
      </Text>
    </Animated.View>
  );
}
