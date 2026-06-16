import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { simStyles } from "./simStyles";

interface SimContinueBarProps {
  isChoice: boolean;
  showResult: boolean;
  selectedChoiceId: string | null;
  isLast: boolean;
  stepXP: number;
  bottomPadding: number;
  onContinue: () => void;
}

export function SimContinueBar({
  isChoice,
  showResult,
  selectedChoiceId,
  isLast,
  stepXP,
  bottomPadding,
  onContinue,
}: SimContinueBarProps) {
  const colors = useColors();

  const canContinue = !isChoice || showResult;

  return (
    <View
      style={[
        simStyles.continueBar,
        { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPadding + 12 },
      ]}
    >
      {canContinue && stepXP > 0 && (
        <Text style={[simStyles.xpHintText, { color: colors.warning }]}>+{stepXP} XP kazandın</Text>
      )}
      <TouchableOpacity
        onPress={onContinue}
        disabled={isChoice && !showResult}
        style={[
          simStyles.continueBtn,
          {
            backgroundColor:
              isChoice && !showResult ? colors.border : colors.primary,
          },
        ]}
        activeOpacity={0.85}
      >
        <Text style={simStyles.continueBtnText}>
          {isChoice && !selectedChoiceId
            ? "Bir seçenek seç"
            : isLast
            ? "Simülasyonu Bitir"
            : "Devam Et"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
