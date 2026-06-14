import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { BadgeData } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

interface BadgeCardProps {
  badge: BadgeData;
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: badge.earned ? colors.card : colors.secondary,
          borderColor: badge.earned ? badge.color + "55" : colors.border,
          opacity: badge.earned ? 1 : 0.5,
        },
      ]}
    >
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: badge.earned
              ? badge.color + "22"
              : colors.border,
          },
        ]}
      >
        <Feather
          name={badge.icon as any}
          size={22}
          color={badge.earned ? badge.color : colors.mutedForeground}
        />
      </View>
      <Text
        style={[
          styles.name,
          { color: badge.earned ? colors.foreground : colors.mutedForeground },
        ]}
        numberOfLines={1}
      >
        {badge.name}
      </Text>
      <Text
        style={[styles.description, { color: colors.mutedForeground }]}
        numberOfLines={2}
      >
        {badge.description}
      </Text>
      {badge.earned && (
        <View
          style={[
            styles.earnedBadge,
            { backgroundColor: badge.color + "22" },
          ]}
        >
          <Feather name="check" size={10} color={badge.color} />
          <Text style={[styles.earnedText, { color: badge.color }]}>
            Kazanıldı
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    textAlign: "center",
  },
  description: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  earnedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  earnedText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 10,
  },
});
