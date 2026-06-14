import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface XPBarProps {
  xp: number;
  progress: number;
  currentRankName: string;
  nextRankName: string | null;
  compact?: boolean;
}

export function XPBar({
  xp,
  progress,
  currentRankName,
  nextRankName,
  compact = false,
}: XPBarProps) {
  const colors = useColors();
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View
          style={[styles.track, { backgroundColor: colors.border, height: 6 }]}
        >
          <Animated.View
            style={[
              styles.fill,
              {
                width: widthInterpolated,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.xpLabel, { color: colors.mutedForeground, fontSize: 11 }]}>
          {xp} XP
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.rankLabel, { color: colors.mutedForeground }]}>
          {currentRankName}
        </Text>
        <Text style={[styles.xpText, { color: colors.primary }]}>
          {xp} XP
        </Text>
        {nextRankName && (
          <Text style={[styles.rankLabel, { color: colors.mutedForeground }]}>
            {nextRankName}
          </Text>
        )}
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: widthInterpolated,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  xpText: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    flex: 1,
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
  xpLabel: {
    fontFamily: "Inter_500Medium",
    minWidth: 44,
    textAlign: "right",
  },
});
