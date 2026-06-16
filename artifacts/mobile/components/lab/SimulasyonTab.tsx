import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import type { Simulation } from "@/data/simulations";
import { styles } from "./labStyles";

const DIFF_LABELS = ["", "Kolay", "Orta", "Zor"] as const;
const DIFF_COLORS = ["", "#00C851", "#FF9500", "#FF3B30"] as const;

interface SimulasyonTabProps {
  simulations: Simulation[];
  completedSims: string[];
  onStartSim: (simId: string) => void;
}

export function SimulasyonTab({
  simulations,
  completedSims,
  onStartSim,
}: SimulasyonTabProps) {
  const colors = useColors();

  return (
    <View style={styles.simSection}>
      <Animated.View
        entering={FadeInDown.delay(120).springify()}
        style={[
          styles.infoBanner,
          {
            backgroundColor: colors.warning + "14",
            borderColor: colors.warning + "28",
          },
        ]}
      >
        <View
          style={[
            styles.infoBannerIcon,
            { backgroundColor: colors.warning + "22" },
          ]}
        >
          <Feather name="play-circle" size={18} color={colors.warning} />
        </View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[styles.infoBannerTitle, { color: colors.foreground }]}>
            Senaryo Simülasyonları
          </Text>
          <Text style={[styles.infoBannerText, { color: colors.mutedForeground }]}>
            Gerçek hayat senaryolarını adım adım yaşa. Doğru kararlar ver, yıldız
            ve XP kazan.
          </Text>
        </View>
      </Animated.View>

      {simulations.map((sim, i) => {
        const done = completedSims.includes(sim.id);
        return (
          <Animated.View
            key={sim.id}
            entering={FadeInDown.delay(100 + i * 60).springify()}
          >
            <TouchableOpacity
              style={[
                styles.simCard,
                {
                  backgroundColor: colors.card,
                  borderColor: done ? colors.success + "44" : colors.border,
                },
              ]}
              onPress={() => onStartSim(sim.id)}
              activeOpacity={0.78}
            >
              <View style={styles.simCardTop}>
                <View
                  style={[
                    styles.simIconBox,
                    {
                      backgroundColor: done
                        ? colors.success + "18"
                        : colors.primary + "18",
                    },
                  ]}
                >
                  <Feather
                    name={done ? "check-circle" : "play-circle"}
                    size={26}
                    color={done ? colors.success : colors.primary}
                  />
                </View>
                <View style={styles.simMeta}>
                  <Text style={[styles.simTitle, { color: colors.foreground }]}>
                    {sim.title}
                  </Text>
                  <Text
                    style={[styles.simDesc, { color: colors.mutedForeground }]}
                    numberOfLines={2}
                  >
                    {sim.description}
                  </Text>
                </View>
              </View>

              <View style={styles.simCardFooter}>
                <View style={[styles.catTag, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.catTagText, { color: colors.mutedForeground }]}>
                    {sim.category}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.simDiff,
                    { color: DIFF_COLORS[sim.difficulty] },
                  ]}
                >
                  {DIFF_LABELS[sim.difficulty]}
                </Text>
                <View style={styles.xpRow}>
                  <Feather name="zap" size={11} color={colors.warning} />
                  <Text style={[styles.simXP, { color: colors.warning }]}>
                    +{sim.xpReward} XP
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );
}
