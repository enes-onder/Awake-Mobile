import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

import { styles } from "./styles";

const CERT_XP_THRESHOLD = 800;

interface CertCardProps {
  xp: number;
  delay?: number;
}

export function CertCard({ xp, delay = 320 }: CertCardProps) {
  const colors = useColors();
  const earned = xp >= CERT_XP_THRESHOLD;
  const fillPercent = `${Math.min((xp / CERT_XP_THRESHOLD) * 100, 100)}%`;

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify()}
      style={[
        styles.certCard,
        { backgroundColor: colors.card, borderColor: colors.warning + "44" },
      ]}
    >
      <View style={styles.certHeader}>
        <View style={[styles.certIconBox, { backgroundColor: colors.warning + "18" }]}>
          <Feather name="file-text" size={22} color={colors.warning} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.certTitle, { color: colors.foreground }]}>Dijital Sertifika</Text>
          <Text style={[styles.certSub, { color: colors.mutedForeground }]}>
            Kıdemli Analist rütbesinde kazanılır · {CERT_XP_THRESHOLD} XP
          </Text>
        </View>
        {earned && (
          <View style={[styles.certBadge, { backgroundColor: colors.warning + "22" }]}>
            <Feather name="check" size={14} color={colors.warning} />
          </View>
        )}
      </View>
      <View style={[styles.certTrack, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.certFill,
            { backgroundColor: colors.warning, width: fillPercent as any },
          ]}
        />
      </View>
      <Text style={[styles.certText, { color: colors.mutedForeground }]}>
        {earned
          ? "✓ Sertifika kazanıldı!"
          : `${Math.max(CERT_XP_THRESHOLD - xp, 0)} XP daha kazan`}
      </Text>
    </Animated.View>
  );
}
