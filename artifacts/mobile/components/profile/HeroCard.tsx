import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import { RankBadge } from "@/components/RankBadge";
import { XPBar } from "@/components/XPBar";
import type { Rank } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

import { ProfileInitials } from "./ProfileInitials";
import { styles } from "./styles";

const TOPIC_LABELS: Record<string, string> = {
  politics: "Siyaset",
  health: "Sağlık",
  science: "Bilim",
  economy: "Ekonomi",
  social: "Sosyal Medya",
  environment: "Çevre",
  tech: "Teknoloji",
  general: "Genel",
};

interface HeroCardProps {
  username: string;
  bio: string;
  favoriteTopic: string;
  rank: Rank;
  nextRank: Rank | null;
  xp: number;
  xpProgress: number;
  streak: number;
}

export function HeroCard({
  username,
  bio,
  favoriteTopic,
  rank,
  nextRank,
  xp,
  xpProgress,
  streak,
}: HeroCardProps) {
  const colors = useColors();
  const r = useResponsive();

  return (
    <View
      style={[
        styles.heroCard,
        { backgroundColor: colors.primary + "0D", borderColor: colors.primary + "2E" },
      ]}
    >
      <ProfileInitials name={username || "Ajan"} size={84} />

      <View style={styles.nameBlock}>
        <Text style={[styles.heroName, { color: colors.foreground, fontSize: r.fs(22) }]}>
          {username || "Ajan"}
        </Text>
        {bio ? (
          <Text
            style={[styles.heroBio, { color: colors.mutedForeground }]}
            numberOfLines={2}
          >
            {bio}
          </Text>
        ) : null}
        {favoriteTopic ? (
          <View
            style={[
              styles.topicPill,
              { backgroundColor: colors.primary + "18", borderColor: colors.primary + "33" },
            ]}
          >
            <Feather name="tag" size={10} color={colors.primary} />
            <Text style={[styles.topicPillText, { color: colors.primary }]}>
              {TOPIC_LABELS[favoriteTopic] ?? favoriteTopic}
            </Text>
          </View>
        ) : null}
      </View>

      <RankBadge rank={rank} size="md" />

      <View style={{ width: "100%" }}>
        <XPBar
          xp={xp}
          progress={xpProgress}
          currentRankName={rank.name}
          nextRankName={nextRank?.name ?? null}
        />
      </View>

      {streak > 0 && (
        <View
          style={[
            styles.streakRow,
            { backgroundColor: "#FF6B35" + "14", borderColor: "#FF6B35" + "40" },
          ]}
        >
          <Text style={styles.streakFire}>🔥</Text>
          <Text style={[styles.streakText, { color: "#FF6B35" }]}>
            {streak} günlük seri
          </Text>
          <View style={[styles.streakPill, { backgroundColor: "#FF6B35" + "22" }]}>
            <Text style={[styles.streakPillText, { color: "#FF6B35" }]}>devam ediyor</Text>
          </View>
        </View>
      )}
    </View>
  );
}
