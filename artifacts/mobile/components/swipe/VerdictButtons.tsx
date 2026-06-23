import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import ReAnimated from "react-native-reanimated";
import type { AnimatedStyle } from "react-native-reanimated";
import type { TextStyle } from "react-native";

import { useColors } from "@/hooks/useColors";
import { styles } from "./swipeCardStyles";

interface VerdictButtonsProps {
  clueCount: number;
  clueIndex: number;
  onUseClue: () => void;
  onVerdictFake: () => void;
  onVerdictReal: () => void;
  xpPenaltyAnimStyle: AnimatedStyle<TextStyle>;
  sp: (base: number) => number;
}

export function VerdictButtons({
  clueCount,
  clueIndex,
  onUseClue,
  onVerdictFake,
  onVerdictReal,
  xpPenaltyAnimStyle,
  sp,
}: VerdictButtonsProps) {
  const colors = useColors();

  return (
    <>
      <View style={styles.hintRow}>
        {clueIndex < clueCount ? (
          <View style={{ position: "relative", width: "100%" }}>
            <TouchableOpacity
              onPress={onUseClue}
              style={[styles.hintBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            >
              <Feather name="search" size={14} color={colors.primary} />
              <Text style={[styles.hintText, { color: colors.primary }]}>
                İpucu Al ({clueCount - clueIndex} kalan)
              </Text>
            </TouchableOpacity>
            <ReAnimated.Text style={[styles.xpPenaltyText, xpPenaltyAnimStyle]}>
              −5 XP
            </ReAnimated.Text>
          </View>
        ) : (
          <View
            style={[
              styles.hintBtn,
              { backgroundColor: colors.success + "18", borderColor: colors.success + "44" },
            ]}
          >
            <Feather name="check" size={14} color={colors.success} />
            <Text style={[styles.hintText, { color: colors.success }]}>
              Tüm ipuçları kullanıldı
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.verdictBtn,
            { backgroundColor: colors.fake + "18", borderColor: colors.fake, paddingVertical: sp(14) },
          ]}
          onPress={onVerdictFake}
          activeOpacity={0.8}
        >
          <Feather name="x" size={20} color={colors.fake} />
          <Text style={[styles.verdictBtnText, { color: colors.fake }]}>YANLIŞ</Text>
        </TouchableOpacity>

        <View style={styles.swipeHint}>
          <Feather name="move" size={14} color={colors.mutedForeground} />
        </View>

        <TouchableOpacity
          style={[
            styles.verdictBtn,
            { backgroundColor: colors.real + "18", borderColor: colors.real, paddingVertical: sp(14) },
          ]}
          onPress={onVerdictReal}
          activeOpacity={0.8}
        >
          <Feather name="check" size={20} color={colors.real} />
          <Text style={[styles.verdictBtnText, { color: colors.real }]}>DOĞRU</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}
