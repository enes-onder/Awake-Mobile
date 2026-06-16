import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import type { Rank } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

import { styles } from "./styles";

interface RankPathProps {
  ranks: Rank[];
  userXp: number;
  rankIdx: number;
  delay?: number;
}

export function RankPath({ ranks, userXp, rankIdx, delay = 260 }: RankPathProps) {
  const colors = useColors();

  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Rütbe Yolu</Text>
      <View style={[styles.rankPath, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {ranks.map((rank, idx) => {
          const reached = userXp >= rank.minXP;
          const isCurrent = idx === rankIdx;
          return (
            <View key={rank.name} style={styles.rankStep}>
              {idx < ranks.length - 1 && (
                <View
                  style={[
                    styles.rankConnector,
                    {
                      backgroundColor:
                        userXp >= ranks[idx + 1].minXP ? rank.color : colors.border,
                    },
                  ]}
                />
              )}
              <View
                style={[
                  styles.rankCircle,
                  {
                    backgroundColor: reached ? rank.color + "22" : colors.secondary,
                    borderColor: isCurrent
                      ? rank.color
                      : reached
                      ? rank.color + "55"
                      : colors.border,
                    borderWidth: isCurrent ? 2.5 : 1,
                  },
                ]}
              >
                <Feather
                  name={rank.icon as any}
                  size={16}
                  color={reached ? rank.color : colors.mutedForeground}
                />
              </View>
              {isCurrent && (
                <View style={[styles.currentDot, { backgroundColor: rank.color }]} />
              )}
              <Text
                style={[
                  styles.rankName,
                  {
                    color: isCurrent ? rank.color : reached ? rank.color : colors.mutedForeground,
                    fontFamily: isCurrent ? "Inter_700Bold" : "Inter_400Regular",
                  },
                ]}
                numberOfLines={2}
              >
                {rank.name}
              </Text>
              <Text style={[styles.rankXP, { color: colors.mutedForeground }]}>
                {rank.minXP}+
              </Text>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );
}
