import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

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
 *
 * clueIndex değişince otomatik olarak en alt ipucuna kaydırılır.
 * maxHeight ekran yüksekliğine oranlanır: height * 0.18, min 112, max 156.
 */
export function CluesArea({ clues, clueIndex, fs }: CluesAreaProps) {
  const colors = useColors();
  const { height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);

  /** Yeni ipucu açılınca otomatik olarak en alta kaydır */
  useEffect(() => {
    if (clueIndex > 0) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      });
    }
  }, [clueIndex]);

  if (clueIndex === 0) return null;

  /** Responsive yükseklik: ekranın %18'i, minimum 112, maksimum 156 */
  const maxClueHeight = Math.min(156, Math.max(112, height * 0.18));

  return (
    <View style={[cardStyles.cluesArea, { borderTopColor: colors.border }]}>
      <ScrollView
        ref={scrollRef}
        style={{ maxHeight: maxClueHeight }}
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
  clueGap: {
    marginTop: 8,
  },
});
