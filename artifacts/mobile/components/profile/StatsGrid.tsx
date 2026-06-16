import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

import { styles } from "./styles";

interface StatItem {
  icon: string;
  color: string;
  value: string;
  label: string;
}

interface StatsGridProps {
  items: StatItem[];
  startDelay?: number;
}

export function StatsGrid({ items, startDelay = 120 }: StatsGridProps) {
  const colors = useColors();
  const r = useResponsive();

  return (
    <View style={styles.statsGrid}>
      {items.map((item, i) => (
        <Animated.View
          key={item.label}
          entering={FadeInDown.delay(startDelay + i * 40).springify()}
          style={[
            styles.statCard,
            { backgroundColor: colors.card, borderColor: item.color + "30" },
          ]}
        >
          <View style={[styles.statIconBox, { backgroundColor: item.color + "18" }]}>
            <Feather name={item.icon as any} size={18} color={item.color} />
          </View>
          <Text style={[styles.statVal, { color: colors.foreground, fontSize: r.fs(24) }]}>
            {item.value}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
            {item.label}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}
