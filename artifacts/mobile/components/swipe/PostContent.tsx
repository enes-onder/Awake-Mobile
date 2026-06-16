import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Mission } from "@/data/missions";
import { PLATFORM_ICONS, PLATFORM_COLORS } from "./swipeConstants";
import { styles } from "./swipeCardStyles";

interface PostContentProps {
  mission: Mission;
  fs: (base: number) => number;
}

export function PostContent({ mission, fs }: PostContentProps) {
  const colors = useColors();
  const platformColor = PLATFORM_COLORS[mission.content.platform] || colors.primary;

  return (
    <>
      <View style={[styles.platformBar, { backgroundColor: platformColor + "18" }]}>
        <Feather name={PLATFORM_ICONS[mission.content.platform] as any} size={14} color={platformColor} />
        <Text style={[styles.platformName, { color: platformColor }]}>
          {mission.content.platform.toUpperCase()}
        </Text>
        <View style={styles.platformRight}>
          <View style={[styles.categoryTag, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.categoryText, { color: colors.mutedForeground }]}>
              {mission.category}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.postHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + "33" }]}>
          <Feather name="user" size={18} color={colors.primary} />
        </View>
        <View style={styles.postHeaderText}>
          <Text style={[styles.accountName, { color: colors.foreground, fontSize: fs(14) }]}>
            {mission.content.accountName}
          </Text>
          <Text style={[styles.accountHandle, { color: colors.mutedForeground, fontSize: fs(12) }]}>
            {mission.content.accountHandle} · {mission.content.timestamp}
          </Text>
        </View>
      </View>

      <Text style={[styles.postText, { color: colors.foreground, fontSize: fs(15), lineHeight: fs(23) }]}>
        {mission.content.text}
      </Text>

      {mission.content.imageTag && (
        <View style={[styles.imageTag, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="image" size={16} color={colors.mutedForeground} />
          <Text style={[styles.imageTagText, { color: colors.mutedForeground }]}>
            {mission.content.imageTag}
          </Text>
        </View>
      )}

      <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
        <View style={styles.stat}>
          <Feather name="heart" size={13} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {mission.content.likes || "—"}
          </Text>
        </View>
        <View style={styles.stat}>
          <Feather name="repeat" size={13} color={colors.mutedForeground} />
          <Text style={[styles.statText, { color: colors.mutedForeground }]}>
            {mission.content.shares}
          </Text>
        </View>
      </View>
    </>
  );
}
