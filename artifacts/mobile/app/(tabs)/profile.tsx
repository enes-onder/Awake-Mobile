import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RankBadge } from "@/components/RankBadge";
import { XPBar } from "@/components/XPBar";
import { RANKS, useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

function Initials({ name, size }: { name: string; size: number }) {
  const colors = useColors();
  const parts = name.trim().split(" ").filter(Boolean);
  const letters =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : (parts[0]?.[0] ?? "A").toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.primary + "22",
        borderWidth: 2.5,
        borderColor: colors.primary + "55",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_700Bold",
          fontSize: size * 0.36,
          color: colors.primary,
          letterSpacing: 1,
        }}
      >
        {letters}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const router = useRouter();

  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const rankIdx = RANKS.indexOf(user.rank);

  const statItems = [
    { icon: "check-circle", color: colors.success, value: String(user.completedMissions.length), label: "Çözülen Vaka" },
    { icon: "crosshair", color: colors.primary, value: `${user.accuracyRate}%`, label: "Doğruluk" },
    { icon: "zap", color: colors.warning, value: String(user.xp), label: "Toplam XP" },
    { icon: "award", color: "#9B59B6", value: String(user.getBadges().filter((b) => b.earned).length), label: "Rozet" },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{
        paddingTop: topPadding + 16,
        paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90,
        paddingHorizontal: r.hp,
        gap: 16,
        maxWidth: r.maxW,
        alignSelf: "center" as const,
        width: "100%",
      }}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.headerRow}>
        <Text style={[styles.pageTitle, { color: colors.foreground, fontSize: r.fs(28) }]}>Profil</Text>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          onPress={() => router.push("/edit-profile")}
          activeOpacity={0.7}
        >
          <Feather name="edit-2" size={14} color={colors.foreground} />
          <Text style={[styles.editBtnText, { color: colors.foreground }]}>Düzenle</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(60).springify()}
        style={[styles.heroCard, { backgroundColor: colors.primary + "0D", borderColor: colors.primary + "2E" }]}
      >
        <Initials name={user.username || "Ajan"} size={84} />

        <View style={styles.nameBlock}>
          <Text style={[styles.heroName, { color: colors.foreground, fontSize: r.fs(22) }]}>
            {user.username || "Ajan"}
          </Text>
          {user.bio ? (
            <Text style={[styles.heroBio, { color: colors.mutedForeground }]} numberOfLines={2}>
              {user.bio}
            </Text>
          ) : null}
          {user.favoriteTopic ? (
            <View style={[styles.topicPill, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "33" }]}>
              <Feather name="tag" size={10} color={colors.primary} />
              <Text style={[styles.topicPillText, { color: colors.primary }]}>
                {
                  {
                    politics: "Siyaset", health: "Sağlık", science: "Bilim",
                    economy: "Ekonomi", social: "Sosyal Medya", environment: "Çevre",
                    tech: "Teknoloji", general: "Genel",
                  }[user.favoriteTopic] ?? user.favoriteTopic
                }
              </Text>
            </View>
          ) : null}
        </View>

        <RankBadge rank={user.rank} size="md" />

        <View style={{ width: "100%" }}>
          <XPBar
            xp={user.xp}
            progress={user.xpProgress}
            currentRankName={user.rank.name}
            nextRankName={user.nextRank?.name ?? null}
          />
        </View>

        {user.streak > 0 && (
          <View style={[styles.streakRow, { backgroundColor: "#FF6B35" + "14", borderColor: "#FF6B35" + "40" }]}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={[styles.streakText, { color: "#FF6B35" }]}>
              {user.streak} günlük seri
            </Text>
            <View style={[styles.streakPill, { backgroundColor: "#FF6B35" + "22" }]}>
              <Text style={[styles.streakPillText, { color: "#FF6B35" }]}>devam ediyor</Text>
            </View>
          </View>
        )}
      </Animated.View>

      {user.isAnonymous && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <TouchableOpacity
            style={[styles.anonBanner, { backgroundColor: colors.warning + "14", borderColor: colors.warning + "44" }]}
            onPress={() => router.push("/onboarding")}
            activeOpacity={0.8}
          >
            <View style={[styles.anonIconBox, { backgroundColor: colors.warning + "22" }]}>
              <Feather name="user-x" size={18} color={colors.warning} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.anonTitle, { color: colors.foreground }]}>Misafir Hesabı</Text>
              <Text style={[styles.anonSub, { color: colors.mutedForeground }]}>
                İlerlemen kaybolabilir. Kalıcı hesap oluşturmak için dokun.
              </Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.warning} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <View style={styles.statsGrid}>
        {statItems.map((item, i) => (
          <Animated.View
            key={item.label}
            entering={FadeInDown.delay(120 + i * 40).springify()}
            style={[styles.statCard, { backgroundColor: colors.card, borderColor: item.color + "30" }]}
          >
            <View style={[styles.statIconBox, { backgroundColor: item.color + "18" }]}>
              <Feather name={item.icon as any} size={18} color={item.color} />
            </View>
            <Text style={[styles.statVal, { color: colors.foreground, fontSize: r.fs(24) }]}>{item.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(260).springify()}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Rütbe Yolu</Text>
        <View style={[styles.rankPath, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {RANKS.map((rank, idx) => {
            const reached = user.xp >= rank.minXP;
            const isCurrent = idx === rankIdx;
            return (
              <View key={rank.name} style={styles.rankStep}>
                {idx < RANKS.length - 1 && (
                  <View
                    style={[
                      styles.rankConnector,
                      { backgroundColor: user.xp >= RANKS[idx + 1].minXP ? rank.color : colors.border },
                    ]}
                  />
                )}
                <View
                  style={[
                    styles.rankCircle,
                    {
                      backgroundColor: reached ? rank.color + "22" : colors.secondary,
                      borderColor: isCurrent ? rank.color : reached ? rank.color + "55" : colors.border,
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
                <Text style={[styles.rankXP, { color: colors.mutedForeground }]}>{rank.minXP}+</Text>
              </View>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(320).springify()}
        style={[styles.certCard, { backgroundColor: colors.card, borderColor: colors.warning + "44" }]}
      >
        <View style={styles.certHeader}>
          <View style={[styles.certIconBox, { backgroundColor: colors.warning + "18" }]}>
            <Feather name="file-text" size={22} color={colors.warning} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.certTitle, { color: colors.foreground }]}>Dijital Sertifika</Text>
            <Text style={[styles.certSub, { color: colors.mutedForeground }]}>
              Kıdemli Analist rütbesinde kazanılır · 800 XP
            </Text>
          </View>
          {user.xp >= 800 && (
            <View style={[styles.certBadge, { backgroundColor: colors.warning + "22" }]}>
              <Feather name="check" size={14} color={colors.warning} />
            </View>
          )}
        </View>
        <View style={[styles.certTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.certFill,
              {
                backgroundColor: colors.warning,
                width: `${Math.min((user.xp / 800) * 100, 100)}%` as any,
              },
            ]}
          />
        </View>
        <Text style={[styles.certText, { color: colors.mutedForeground }]}>
          {user.xp >= 800 ? "✓ Sertifika kazanıldı!" : `${Math.max(800 - user.xp, 0)} XP daha kazan`}
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(380).springify()}>
        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={user.signOut}
          activeOpacity={0.75}
        >
          <Feather name="log-out" size={16} color={colors.fake} />
          <Text style={[styles.signOutText, { color: colors.fake }]}>Çıkış Yap</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pageTitle: { fontFamily: "Inter_700Bold", fontSize: 28 },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  editBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  heroCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 24,
    alignItems: "center",
    gap: 14,
  },
  nameBlock: {
    alignItems: "center",
    gap: 5,
  },
  heroName: { fontFamily: "Inter_700Bold", fontSize: 22 },
  heroBio: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  topicPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 2,
  },
  topicPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    width: "100%",
  },
  streakFire: { fontSize: 18 },
  streakText: { fontFamily: "Inter_700Bold", fontSize: 14, flex: 1 },
  streakPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  streakPillText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  anonBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  anonIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  anonTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  anonSub: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17, marginTop: 2 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 24 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, marginBottom: 14 },
  rankPath: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  rankStep: {
    flex: 1,
    alignItems: "center",
    gap: 6,
    position: "relative",
  },
  rankConnector: {
    position: "absolute",
    top: 20,
    left: "50%",
    width: "100%",
    height: 2,
    zIndex: -1,
  },
  rankCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  currentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: -4,
  },
  rankName: { fontSize: 10, textAlign: "center", lineHeight: 14 },
  rankXP: { fontFamily: "Inter_400Regular", fontSize: 9 },
  certCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    gap: 14,
  },
  certHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  certIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  certBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  certTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  certSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  certTrack: { height: 10, borderRadius: 5, overflow: "hidden" },
  certFill: { height: "100%", borderRadius: 5 },
  certText: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },
  signOutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  signOutText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
