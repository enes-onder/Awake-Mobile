import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";
import { styles } from "./homeStyles";

interface StatsRowProps {
  completedCount: number;
  accuracyRate: number;
  xp: number;
}

export function StatsRow({ completedCount, accuracyRate, xp }: StatsRowProps) {
  const colors = useColors();
  const r = useResponsive();

  const stats = [
    { icon: "check-circle", color: colors.success, value: String(completedCount), label: "Çözüldü" },
    { icon: "crosshair", color: colors.primary, value: `${accuracyRate}%`, label: "Doğruluk" },
    { icon: "zap", color: colors.warning, value: String(xp), label: "XP" },
  ] as const;

  return (
    <View style={[styles.statsRow, { marginTop: 14, marginBottom: 20 }]}>
      {stats.map((s, i) => (
        <Animated.View
          key={s.label}
          entering={FadeInDown.delay(160 + i * 40).springify()}
          style={[styles.statBox, { backgroundColor: colors.card, borderColor: s.color + "33" }]}
        >
          <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
            <Feather name={s.icon as any} size={16} color={s.color} />
          </View>
          <Text style={[styles.statVal, { color: colors.foreground, fontSize: r.fs(20) }]}>{s.value}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
        </Animated.View>
      ))}
    </View>
  );
}
