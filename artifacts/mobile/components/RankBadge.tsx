import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { Rank } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

interface RankBadgeProps {
  rank: Rank;
  size?: "sm" | "md" | "lg";
}

export function RankBadge({ rank, size = "md" }: RankBadgeProps) {
  const colors = useColors();
  const iconSize = size === "sm" ? 12 : size === "lg" ? 22 : 16;
  const fontSize = size === "sm" ? 11 : size === "lg" ? 16 : 13;
  const padding = size === "sm" ? 4 : size === "lg" ? 10 : 6;
  const gap = size === "sm" ? 4 : 6;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: rank.color + "22",
          borderColor: rank.color + "55",
          paddingHorizontal: padding + 4,
          paddingVertical: padding - 2,
          gap,
        },
      ]}
    >
      <Feather
        name={rank.icon as any}
        size={iconSize}
        color={rank.color}
      />
      <Text style={[styles.label, { color: rank.color, fontSize }]}>
        {rank.name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    borderWidth: 1,
  },
  label: {
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
  },
});
