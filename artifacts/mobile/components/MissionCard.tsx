import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Mission } from "@/data/missions";
import { useColors } from "@/hooks/useColors";

interface MissionCardProps {
  mission: Mission;
  completed?: boolean;
  onPress?: () => void;
  compact?: boolean;
}

const DIFFICULTY_LABELS = ["", "Kolay", "Orta", "Zor"];
const DIFFICULTY_COLORS = ["", "#00C851", "#FF9500", "#FF3B30"];

const TYPE_ICONS: Record<string, string> = {
  photo: "image",
  headline: "type",
  quote: "message-square",
  stats: "bar-chart-2",
  video: "video",
};

const TYPE_LABELS: Record<string, string> = {
  photo: "FOTOĞRAF",
  headline: "BAŞLIK",
  quote: "ALINTILAR",
  stats: "VERİ",
  video: "VİDEO",
};

export function MissionCard({
  mission,
  completed = false,
  onPress,
  compact = false,
}: MissionCardProps) {
  const colors = useColors();
  const diffColor = DIFFICULTY_COLORS[mission.difficulty];

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: completed ? colors.success + "44" : colors.border,
          opacity: completed ? 0.7 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={mission.title}
      accessibilityHint={completed ? "Bu vaka tamamlandı" : "Bu vakayı çözmek için aç"}
      accessibilityState={{ disabled: completed }}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: colors.primary + "22" },
          ]}
        >
          <Feather
            name={TYPE_ICONS[mission.type] as any}
            size={12}
            color={colors.primary}
          />
          <Text style={[styles.typeLabel, { color: colors.primary }]}>
            {TYPE_LABELS[mission.type]}
          </Text>
        </View>
        <View style={styles.rightRow}>
          <Text style={[styles.diffLabel, { color: diffColor }]}>
            {DIFFICULTY_LABELS[mission.difficulty]}
          </Text>
          {completed && (
            <Feather name="check-circle" size={16} color={colors.success} />
          )}
        </View>
      </View>

      {!compact && (
        <>
          <Text
            style={[styles.title, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {mission.title}
          </Text>
          <Text
            style={[styles.description, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {mission.description}
          </Text>
        </>
      )}
      {compact && (
        <Text
          style={[styles.titleCompact, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {mission.title}
        </Text>
      )}

      <View style={styles.footer}>
        <View style={styles.categoryRow}>
          <Feather name="tag" size={11} color={colors.mutedForeground} />
          <Text style={[styles.category, { color: colors.mutedForeground }]}>
            {mission.category}
          </Text>
        </View>
        <View style={styles.xpRow}>
          <Feather name="zap" size={12} color={colors.warning} />
          <Text style={[styles.xp, { color: colors.warning }]}>
            +{mission.xpReward} XP
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  typeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.8,
  },
  rightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  diffLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    lineHeight: 22,
  },
  titleCompact: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    marginTop: 2,
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 2,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  category: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
  },
  xpRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  xp: {
    fontFamily: "Inter_700Bold",
    fontSize: 12,
  },
});
