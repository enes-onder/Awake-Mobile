import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { styles } from "./homeStyles";
import { diffColor, diffLabel } from "./missionHelpers";

interface DailyMissionCardProps {
  mission: {
    id: string;
    title: string;
    description: string;
    difficulty: number;
    xpReward: number;
  };
  dailyPlayedToday: boolean;
}

export function DailyMissionCard({ mission, dailyPlayedToday }: DailyMissionCardProps) {
  const colors = useColors();
  const router = useRouter();

  return (
    <Animated.View entering={FadeInDown.delay(240).springify()} style={{ marginBottom: 24 }}>
      <View style={styles.sectionHeader}>
        <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Günlük Görev</Text>
        {!dailyPlayedToday && (
          <View style={[styles.bonusBadge, { backgroundColor: colors.warning + "22" }]}>
            <Text style={[styles.bonusBadgeText, { color: colors.warning }]}>2x XP</Text>
          </View>
        )}
      </View>
      <TouchableOpacity
        style={[styles.featuredCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "44" }]}
        onPress={() => router.push("/(tabs)/lab")}
        activeOpacity={0.8}
      >
        <View style={styles.featuredTop}>
          <View style={[styles.featuredIconBox, { backgroundColor: colors.primary + "20" }]}>
            <Feather name="target" size={28} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.featuredTitle, { color: colors.foreground }]} numberOfLines={2}>
              {mission.title}
            </Text>
            <Text style={[styles.featuredDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
              {mission.description}
            </Text>
          </View>
        </View>
        <View style={styles.featuredFooter}>
          <View style={[styles.diffTag, { backgroundColor: diffColor(mission.difficulty) + "22" }]}>
            <Text style={[styles.diffTagText, { color: diffColor(mission.difficulty) }]}>
              {diffLabel(mission.difficulty)}
            </Text>
          </View>
          <View style={styles.xpTagRow}>
            <Feather name="zap" size={12} color={colors.warning} />
            <Text style={[styles.xpTagText, { color: colors.warning }]}>+{mission.xpReward} XP</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={styles.startRow}>
            <Text style={[styles.startText, { color: colors.primary }]}>Başla</Text>
            <Feather name="arrow-right" size={14} color={colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
