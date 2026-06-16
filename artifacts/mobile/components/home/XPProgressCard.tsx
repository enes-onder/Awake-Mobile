import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { XPBar } from "@/components/XPBar";
import { useColors } from "@/hooks/useColors";
import type { Rank } from "@/context/UserContext";
import { styles } from "./homeStyles";

interface XPProgressCardProps {
  xp: number;
  progress: number;
  rank: Rank;
  nextRank: Rank | null;
}

export function XPProgressCard({ xp, progress, rank, nextRank }: XPProgressCardProps) {
  const colors = useColors();

  return (
    <Animated.View
      entering={FadeInDown.delay(130).springify()}
      style={[styles.xpCard, { backgroundColor: colors.card, borderColor: colors.primary + "33" }]}
    >
      <View style={styles.xpCardHeader}>
        <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>Rütbe İlerlemesi</Text>
        <Text style={[styles.xpRankName, { color: colors.primary }]}>{rank.name}</Text>
      </View>
      <XPBar
        xp={xp}
        progress={progress}
        currentRankName={rank.name}
        nextRankName={nextRank?.name ?? null}
      />
      {nextRank && (
        <Text style={[styles.xpHint, { color: colors.mutedForeground }]}>
          {nextRank.minXP - xp} XP daha → {nextRank.name}
        </Text>
      )}
    </Animated.View>
  );
}
