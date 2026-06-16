import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { useResponsive } from "@/hooks/useResponsive";
import { api, type LeaderboardEntry } from "@/lib/api";
import { RANKS } from "@/context/UserContext";

function getRankColor(xp: number): string {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i].color;
  }
  return RANKS[0].color;
}

function getRankName(xp: number): string {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i].name;
  }
  return RANKS[0].name;
}

const MEDAL_CONFIG = [
  { rank: 1, emoji: "🥇", color: "#FFD700", bg: "#FFD70018" },
  { rank: 2, emoji: "🥈", color: "#C0C0C0", bg: "#C0C0C018" },
  { rank: 3, emoji: "🥉", color: "#CD7F32", bg: "#CD7F3218" },
];

interface RowProps {
  entry: LeaderboardEntry;
  position: number;
  isMe: boolean;
  index: number;
}

function LeaderRow({ entry, position, isMe, index }: RowProps) {
  const colors = useColors();
  const medal = MEDAL_CONFIG.find((m) => m.rank === position);
  const rankColor = getRankColor(entry.xp);
  const rankName = getRankName(entry.xp);

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index * 40, 400)).springify()}>
      <View
        style={[
          styles.row,
          {
            backgroundColor: isMe
              ? colors.primary + "18"
              : medal
              ? medal.bg
              : colors.card,
            borderColor: isMe
              ? colors.primary + "55"
              : medal
              ? medal.color + "44"
              : colors.border,
          },
        ]}
      >
        <View style={styles.positionCol}>
          {medal ? (
            <Text style={styles.medalEmoji}>{medal.emoji}</Text>
          ) : (
            <Text style={[styles.positionNum, { color: colors.mutedForeground }]}>
              {position}
            </Text>
          )}
        </View>

        <View style={[styles.avatar, { backgroundColor: rankColor + "22", borderColor: rankColor + "44" }]}>
          <Text style={[styles.avatarLetter, { color: rankColor }]}>
            {entry.username.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.username,
                {
                  color: isMe ? colors.primary : colors.foreground,
                  fontFamily: isMe ? "Inter_700Bold" : "Inter_600SemiBold",
                },
              ]}
              numberOfLines={1}
            >
              {entry.username}
              {isMe ? " (sen)" : ""}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.rankTag, { backgroundColor: rankColor + "18" }]}>
              <Text style={[styles.rankTagText, { color: rankColor }]}>{rankName}</Text>
            </View>
            {entry.streak > 0 && (
              <View style={styles.streakPill}>
                <Text style={styles.streakPillText}>🔥 {entry.streak}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.xpCol}>
          <Text style={[styles.xpVal, { color: medal ? medal.color : isMe ? colors.primary : colors.foreground }]}>
            {entry.xp.toLocaleString()}
          </Text>
          <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>XP</Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function LeaderboardScreen() {
  const colors = useColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { username } = useUser();

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .getLeaderboard(50)
      .then((data) => {
        if (!cancelled) setEntries(data);
      })
      .catch(() => {
        if (!cancelled) setError("Liderlik tablosu yüklenemedi.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const myPosition = entries.findIndex((e) => e.username === username) + 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: topPadding + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Liderlik Tablosu</Text>
          {myPosition > 0 && (
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Sıralaman: #{myPosition}
            </Text>
          )}
        </View>
        <View style={{ width: 38 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>Yükleniyor…</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Feather name="wifi-off" size={40} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              setLoading(true);
              api.getLeaderboard(50).then(setEntries).catch(() => setError("Tekrar deneyin.")).finally(() => setLoading(false));
            }}
            style={[styles.retryBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.retryBtnText}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.center}>
          <Feather name="users" size={40} color={colors.mutedForeground} />
          <Text style={[styles.errorText, { color: colors.mutedForeground }]}>
            Henüz sıralamada kimse yok.{"\n"}Oynayarak ilk sen gir!
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: r.hp,
            paddingTop: 12,
            paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90,
            gap: 8,
            maxWidth: r.maxW,
            alignSelf: "center" as const,
            width: "100%",
          }}
          renderItem={({ item, index }) => (
            <LeaderRow
              entry={item}
              position={index + 1}
              isMe={item.username === username}
              index={index}
            />
          )}
          ListHeaderComponent={
            entries.length > 0 ? (
              <Animated.View
                entering={FadeInRight.delay(0).springify()}
                style={[styles.podiumCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Text style={[styles.podiumTitle, { color: colors.foreground }]}>🏆 Top 3</Text>
                <View style={styles.podiumRow}>
                  {entries.slice(0, 3).map((e, i) => {
                    const medal = MEDAL_CONFIG[i]!;
                    return (
                      <View key={e.id} style={styles.podiumItem}>
                        <Text style={styles.podiumEmoji}>{medal.emoji}</Text>
                        <Text
                          style={[styles.podiumName, { color: medal.color }]}
                          numberOfLines={1}
                        >
                          {e.username}
                        </Text>
                        <Text style={[styles.podiumXP, { color: colors.mutedForeground }]}>
                          {e.xp.toLocaleString()} XP
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 8,
  },
  backBtn: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  headerSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 32 },
  loadingText: { fontFamily: "Inter_400Regular", fontSize: 14 },
  errorText: { fontFamily: "Inter_400Regular", fontSize: 14, textAlign: "center", lineHeight: 22 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  retryBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: "#fff" },
  podiumCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 8,
  },
  podiumTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 16, textAlign: "center" },
  podiumRow: { flexDirection: "row", justifyContent: "space-around" },
  podiumItem: { alignItems: "center", gap: 4, flex: 1 },
  podiumEmoji: { fontSize: 28 },
  podiumName: { fontFamily: "Inter_700Bold", fontSize: 13, textAlign: "center" },
  podiumXP: { fontFamily: "Inter_400Regular", fontSize: 11, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  positionCol: { width: 28, alignItems: "center" },
  medalEmoji: { fontSize: 22 },
  positionNum: { fontFamily: "Inter_700Bold", fontSize: 15 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLetter: { fontFamily: "Inter_700Bold", fontSize: 18 },
  userInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  username: { fontSize: 14, flexShrink: 1 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  rankTag: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  rankTagText: { fontFamily: "Inter_600SemiBold", fontSize: 10 },
  streakPill: { flexDirection: "row", alignItems: "center" },
  streakPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: "#FF6B35" },
  xpCol: { alignItems: "flex-end", gap: 2 },
  xpVal: { fontFamily: "Inter_700Bold", fontSize: 16 },
  xpLabel: { fontFamily: "Inter_400Regular", fontSize: 10 },
});
