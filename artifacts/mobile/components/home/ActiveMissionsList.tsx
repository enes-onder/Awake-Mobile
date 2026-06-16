import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";
import { PulseDot } from "./PulseDot";
import { styles } from "./homeStyles";
import { diffColor, diffLabel, TYPE_ICONS } from "./missionHelpers";

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  type: string;
  xpReward: number;
  category: string;
}

interface ActiveMissionsListProps {
  missions: Mission[];
  pendingCount: number;
}

export function ActiveMissionsList({ missions, pendingCount }: ActiveMissionsListProps) {
  const colors = useColors();
  const r = useResponsive();
  const router = useRouter();

  const previewMissions = missions.slice(0, 4);

  return (
    <Animated.View entering={FadeInDown.delay(290).springify()} style={{ marginBottom: 24 }}>
      <View style={styles.sectionHeader}>
        <PulseDot color={colors.warning} />
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Aktif Vakalar</Text>
        <Text style={[styles.countBadge, { color: colors.mutedForeground }]}>
          {pendingCount} kalan
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingRight: r.hp }}
        style={{ marginHorizontal: -r.hp, paddingHorizontal: r.hp }}
      >
        {previewMissions.map((mission) => (
          <TouchableOpacity
            key={mission.id}
            style={[
              styles.missionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                width: r.isTablet ? 220 : 185,
              },
            ]}
            onPress={() => router.push("/(tabs)/lab")}
            activeOpacity={0.78}
          >
            <View style={[styles.missionTypeIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={TYPE_ICONS[mission.type] as any} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.missionTitle, { color: colors.foreground }]} numberOfLines={2}>
              {mission.title}
            </Text>
            <Text style={[styles.missionCat, { color: colors.mutedForeground }]} numberOfLines={1}>
              {mission.category}
            </Text>
            <View style={styles.missionCardFooter}>
              <View style={[styles.diffTag, { backgroundColor: diffColor(mission.difficulty) + "22" }]}>
                <Text style={[styles.diffTagText, { color: diffColor(mission.difficulty) }]}>
                  {diffLabel(mission.difficulty)}
                </Text>
              </View>
              <View style={styles.xpTagRow}>
                <Feather name="zap" size={10} color={colors.warning} />
                <Text style={[styles.missionXP, { color: colors.warning }]}>+{mission.xpReward}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.missionCardMore,
            { backgroundColor: colors.primary + "14", borderColor: colors.primary + "33" },
          ]}
          onPress={() => router.push("/(tabs)/lab")}
          activeOpacity={0.78}
        >
          <Feather name="layers" size={20} color={colors.primary} />
          <Text style={[styles.missionCardMoreText, { color: colors.primary }]}>Tümü</Text>
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
}
