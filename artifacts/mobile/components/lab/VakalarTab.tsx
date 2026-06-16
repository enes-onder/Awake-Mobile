import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { Mission } from "@/data/missions";
import { styles } from "./labStyles";

const DIFF_LABELS = ["", "Kolay", "Orta", "Zor"] as const;
const DIFF_COLORS = ["", "#00C851", "#FF9500", "#FF3B30"] as const;
const TYPE_ICONS: Record<string, string> = {
  photo: "image",
  headline: "type",
  quote: "message-square",
  stats: "bar-chart-2",
  video: "video",
};

interface VakalarTabProps {
  pendingMissions: Mission[];
  completedMissions: Mission[];
  onStartMission: (idx: number) => void;
}

export function VakalarTab({
  pendingMissions,
  completedMissions,
  onStartMission,
}: VakalarTabProps) {
  const colors = useColors();

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(120).springify()}
        style={[
          styles.infoBanner,
          {
            backgroundColor: colors.primary + "14",
            borderColor: colors.primary + "28",
          },
        ]}
      >
        <View
          style={[styles.infoBannerIcon, { backgroundColor: colors.primary + "22" }]}
        >
          <Feather name="search" size={18} color={colors.primary} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[styles.infoBannerTitle, { color: colors.foreground }]}>
            Araştırma Laboratuvarı
          </Text>
          <Text style={[styles.infoBannerText, { color: colors.mutedForeground }]}>
            Paylaşımları incele, doğru mu yanlış mı karar ver. Doğru cevap XP
            kazandırır, yanlış cevap XP düşürür.
          </Text>
        </View>
      </Animated.View>

      <View style={styles.quickStats}>
        <View
          style={[
            styles.quickStat,
            {
              backgroundColor: colors.primary + "14",
              borderColor: colors.primary + "33",
            },
          ]}
        >
          <Feather name="clock" size={13} color={colors.primary} />
          <Text style={[styles.quickStatText, { color: colors.primary }]}>
            Bekleyen · {pendingMissions.length}
          </Text>
        </View>
        <View
          style={[
            styles.quickStat,
            {
              backgroundColor: colors.success + "14",
              borderColor: colors.success + "33",
            },
          ]}
        >
          <Feather name="check-circle" size={13} color={colors.success} />
          <Text style={[styles.quickStatText, { color: colors.success }]}>
            Tamamlanan · {completedMissions.length}
          </Text>
        </View>
      </View>

      {pendingMissions.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(140).springify()}
          style={styles.missionSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Aktif Vakalar
          </Text>
          {pendingMissions.map((mission, idx) => (
            <Animated.View
              key={mission.id}
              entering={FadeInDown.delay(160 + idx * 50).springify()}
            >
              <TouchableOpacity
                style={[
                  styles.missionItem,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => onStartMission(idx)}
                activeOpacity={0.78}
              >
                <View
                  style={[styles.missionIcon, { backgroundColor: colors.secondary }]}
                >
                  <Feather
                    name={TYPE_ICONS[mission.type] as any}
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.missionMeta}>
                  <Text
                    style={[styles.missionTitle, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {mission.title}
                  </Text>
                  <Text
                    style={[
                      styles.missionCategory,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {mission.category}
                  </Text>
                </View>
                <View style={styles.missionRight}>
                  <Text
                    style={[
                      styles.diffText,
                      { color: DIFF_COLORS[mission.difficulty] },
                    ]}
                  >
                    {DIFF_LABELS[mission.difficulty]}
                  </Text>
                  <View style={styles.xpRow}>
                    <Feather name="zap" size={11} color={colors.warning} />
                    <Text style={[styles.xpText, { color: colors.warning }]}>
                      +{mission.xpReward}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      {completedMissions.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={styles.missionSection}
        >
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Tamamlananlar ({completedMissions.length})
          </Text>
          {completedMissions.map((mission) => (
            <View
              key={mission.id}
              style={[
                styles.missionItem,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.success + "33",
                  opacity: 0.6,
                },
              ]}
            >
              <View
                style={[
                  styles.missionIcon,
                  { backgroundColor: colors.success + "18" },
                ]}
              >
                <Feather name="check-circle" size={18} color={colors.success} />
              </View>
              <View style={styles.missionMeta}>
                <Text
                  style={[styles.missionTitle, { color: colors.foreground }]}
                  numberOfLines={1}
                >
                  {mission.title}
                </Text>
                <Text
                  style={[
                    styles.missionCategory,
                    { color: colors.mutedForeground },
                  ]}
                >
                  {mission.category}
                </Text>
              </View>
              <Feather name="check" size={16} color={colors.success} />
            </View>
          ))}
        </Animated.View>
      )}

      {pendingMissions.length === 0 && (
        <Animated.View
          entering={FadeInDown.delay(140).springify()}
          style={[
            styles.allDoneBox,
            {
              backgroundColor: colors.success + "10",
              borderColor: colors.success + "33",
            },
          ]}
        >
          <Feather name="award" size={44} color={colors.success} />
          <Text style={[styles.allDoneTitle, { color: colors.foreground }]}>
            Tüm vakalar tamamlandı!
          </Text>
          <Text style={[styles.allDoneSub, { color: colors.mutedForeground }]}>
            Harika iş, ajan. Yeni vakalar yakında geliyor.
          </Text>
        </Animated.View>
      )}
    </>
  );
}
