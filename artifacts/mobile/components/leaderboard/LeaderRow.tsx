import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { LeaderboardEntry } from "@/lib/api";
import { getRankColor, getRankName, MEDAL_CONFIG } from "./leaderboardHelpers";
import { styles } from "./leaderboardStyles";

interface LeaderRowProps {
  entry: LeaderboardEntry;
  position: number;
  isMe: boolean;
  index: number;
}

export function LeaderRow({ entry, position, isMe, index }: LeaderRowProps) {
  const colors = useColors();
  const medal = MEDAL_CONFIG.find((m) => m.rank === position);
  const rankColor = getRankColor(entry.xp);
  const rankName = getRankName(entry.xp);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 400)).springify()}>
      <View
        style={[
          styles.row,
          {
            backgroundColor: isMe
              ? colors.primary + "18"
              : medal
              ? medal.bg
              : colors.card,
            borderColor: isMe
              ? colors.primary + "55"
              : medal
              ? medal.color + "44"
              : colors.border,
          },
        ]}
      >
        <View style={styles.positionCol}>
          {medal ? (
            <Text style={styles.medalEmoji}>{medal.emoji}</Text>
          ) : (
            <Text style={[styles.positionNum, { color: colors.mutedForeground }]}>
              {position}
            </Text>
          )}
        </View>

        <View style={[styles.avatar, { backgroundColor: rankColor + "22", borderColor: rankColor + "44" }]}>
          <Text style={[styles.avatarLetter, { color: rankColor }]}>
            {entry.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.username,
                {
                  color: isMe ? colors.primary : colors.foreground,
                  fontFamily: isMe ? "Inter_700Bold" : "Inter_600SemiBold",
                },
              ]}
              numberOfLines={1}
            >
              {entry.username}
              {isMe ? " (sen)" : ""}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.rankTag, { backgroundColor: rankColor + "18" }]}>
              <Text style={[styles.rankTagText, { color: rankColor }]}>{rankName}</Text>
            </View>
            {entry.streak > 0 && (
              <View style={styles.streakPill}>
                <Text style={styles.streakPillText}>🔥 {entry.streak}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.xpCol}>
          <Text style={[styles.xpVal, { color: medal ? medal.color : isMe ? colors.primary : colors.foreground }]}>
            {entry.xp.toLocaleString()}
          </Text>
          <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>XP</Text>
        </View>
      </View>
    </Animated.View>
  );
}
