import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { styles as cardStyles } from "./swipeCardStyles";

interface CluesAreaProps {
  clues: string[];
  clueIndex: number;
  fs: (base: number) => number;
}

/**
 * CluesArea — Açılmış ipuçlarını kart içinde gösterir.
 *
 * İpuçları ScrollView içinde render edilir; kart maxHeight'ı aşıldığında
 * ipuçları scroll ile okunabilir, kart kesilmez ve karar butonları erişilebilir kalır.
 * nestedScrollEnabled: PanResponder (yatay swipe) ile dikey scroll çakışmaz.
 */
export function CluesArea({ clues, clueIndex, fs }: CluesAreaProps) {
  const colors = useColors();

  if (clueIndex === 0) return null;

  return (
    <View style={[cardStyles.cluesArea, { borderTopColor: colors.border }]}>
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
      >
        {clues.slice(0, clueIndex).map((clue, i) => (
          <View
            key={i}
            style={[
              cardStyles.clue,
              { backgroundColor: colors.primary + "12" },
              i > 0 && styles.clueGap,
            ]}
          >
            <Feather name="info" size={12} color={colors.primary} />
            <Text
              style={[
                cardStyles.clueText,
                { color: colors.foreground, fontSize: fs(13) },
              ]}
            >
              {clue}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  /** 2-3 ipucu görünür, fazlası scroll ile okunur */
  scroll: {
    maxHeight: 132,
  },
  clueGap: {
    marginTop: 8,
  },
});
