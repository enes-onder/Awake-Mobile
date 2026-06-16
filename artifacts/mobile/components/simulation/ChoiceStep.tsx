import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";
import type { Simulation } from "@/data/simulations";
import { AnimatedChoiceButton } from "./AnimatedChoiceButton";
import { simStyles } from "./simStyles";

interface ChoiceStepProps {
  step: Simulation["steps"][number];
  stepIdx: number;
  selectedChoiceId: string | null;
  showResult: boolean;
  onChoice: (id: string) => void;
}

export function ChoiceStep({
  step,
  stepIdx,
  selectedChoiceId,
  showResult,
  onChoice,
}: ChoiceStepProps) {
  const colors = useColors();
  const r = useResponsive();

  const selectedChoice = step.choices?.find((c) => c.id === selectedChoiceId);

  return (
    <Animated.View
      key={`choice-${stepIdx}`}
      entering={FadeInDown.springify()}
      style={{ gap: 14 }}
    >
      <Text
        style={[
          simStyles.choiceSectionTitle,
          { color: colors.foreground, fontSize: r.fs(18), lineHeight: r.fs(28) },
        ]}
      >
        {step.text}
      </Text>

      <View style={{ gap: r.sp(10) }}>
        {(step.choices ?? []).map((choice, i) => (
          <AnimatedChoiceButton
            key={choice.id}
            choice={choice}
            index={i}
            selected={selectedChoiceId === choice.id}
            answered={showResult}
            onPress={onChoice}
          />
        ))}
      </View>

      {showResult && selectedChoice && (
        <Animated.View
          entering={FadeInUp.springify()}
          style={[
            simStyles.explanationCard,
            {
              backgroundColor: selectedChoice.isCorrect
                ? colors.success + "12"
                : colors.fake + "12",
              borderColor: selectedChoice.isCorrect
                ? colors.success + "44"
                : colors.fake + "44",
              padding: r.sp(14),
              borderRadius: r.sp(14),
            },
          ]}
        >
          <View style={simStyles.explanationHeader}>
            <Feather
              name={selectedChoice.isCorrect ? "check-circle" : "info"}
              size={r.sp(16)}
              color={selectedChoice.isCorrect ? colors.success : colors.fake}
            />
            <Text
              style={[
                simStyles.explanationTitle,
                {
                  color: selectedChoice.isCorrect ? colors.success : colors.fake,
                  fontSize: r.fs(14),
                  flex: 1,
                },
              ]}
            >
              {selectedChoice.isCorrect ? "Doğru Karar!" : "Yanlış Karar"}
            </Text>
            {selectedChoice.xpReward > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                <Feather name="zap" size={r.sp(11)} color={colors.warning} />
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    color: colors.warning,
                    fontSize: r.fs(12),
                  }}
                >
                  +{selectedChoice.xpReward}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              simStyles.explanationText,
              { color: colors.foreground, fontSize: r.fs(14), lineHeight: r.fs(22) },
            ]}
          >
            {selectedChoice.explanation}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}
