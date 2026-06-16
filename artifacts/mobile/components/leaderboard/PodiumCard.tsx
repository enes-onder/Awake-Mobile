import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { LeaderboardEntry } from "@/lib/api";
import { MEDAL_CONFIG } from "./leaderboardHelpers";
import { styles } from "./leaderboardStyles";

interface PodiumCardProps {
  entries: LeaderboardEntry[];
}

export function PodiumCard({ entries }: PodiumCardProps) {
  const colors = useColors();

  if (entries.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInRight.delay(0).springify()}
      style={[styles.podiumCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <Text style={[styles.podiumTitle, { color: colors.foreground }]}>🏆 Top 3</Text>
      <View style={styles.podiumRow}>
        {entries.slice(0, 3).map((e, i) => {
          const medal = MEDAL_CONFIG[i]!;
          return (
            <View key={e.id} style={styles.podiumItem}>
              <Text style={styles.podiumEmoji}>{medal.emoji}</Text>
              <Text style={[styles.podiumName, { color: medal.color }]} numberOfLines={1}>
                {e.username}
              </Text>
              <Text style={[styles.podiumXP, { color: colors.mutedForeground }]}>
                {e.xp.toLocaleString()} XP
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}
