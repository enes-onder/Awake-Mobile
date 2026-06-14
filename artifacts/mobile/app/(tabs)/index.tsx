import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RankBadge } from "@/components/RankBadge";
import { XPBar } from "@/components/XPBar";
import { useUser } from "@/context/UserContext";
import { useContent } from "@/context/ContentContext";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

function PulseDot({ color }: { color: string }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 900 }),
        withTiming(1, { duration: 900 })
      ),
      -1,
      true
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[animStyle, styles.pulseDot, { backgroundColor: color }]} />;
}

function StreakCard({ streak, playedToday }: { streak: number; playedToday: boolean }) {
  const colors = useColors();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!playedToday && streak > 0) {
      scale.value = withRepeat(
        withSequence(withSpring(1.04, { damping: 4 }), withSpring(1, { damping: 6 })),
        3,
        true
      );
    }
  }, []);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (streak === 0 && playedToday) return null;

  return (
    <Animated.View entering={FadeInDown.delay(70).springify()}>
    <Animated.View style={animStyle}>
      <View
        style={[
          styles.streakCard,
          {
            backgroundColor: playedToday ? "#FF6B35" + "14" : colors.fake + "14",
            borderColor: playedToday ? "#FF6B35" + "44" : colors.fake + "44",
          },
        ]}
      >
        <Text style={styles.streakEmoji}>{playedToday ? "🔥" : "⚠️"}</Text>
        <View style={{ flex: 1 }}>
          {streak > 0 ? (
            <>
              <Text style={[styles.streakTitle, { color: playedToday ? "#FF6B35" : colors.fake }]}>
                {streak} günlük seri{playedToday ? " devam ediyor!" : " — bugün oynaman gerek!"}
              </Text>
              <Text style={[styles.streakSub, { color: colors.mutedForeground }]}>
                {playedToday
                  ? "Harika iş! Serini kırmaya devam et."
                  : "Bugün bir vaka çözmezsen serini kaybedersin."}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.streakTitle, { color: colors.primary }]}>
                İlk gününü başlat!
              </Text>
              <Text style={[styles.streakSub, { color: colors.mutedForeground }]}>
                Her gün oynayarak seri oluştur, bonus XP kazan.
              </Text>
            </>
          )}
        </View>
        {streak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: playedToday ? "#FF6B35" : colors.fake }]}>
            <Text style={styles.streakBadgeNum}>{streak}</Text>
          </View>
        )}
      </View>
    </Animated.View>
    </Animated.View>
  );
}

export default function KarargahScreen() {
  const colors = useColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useUser();
  const { missions } = useContent();

  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const pendingMissions = missions.filter(
    (m) => !user.completedMissions.includes(m.id)
  );
  const completedMissions = missions.filter((m) =>
    user.completedMissions.includes(m.id)
  );
  const dailyMission = pendingMissions[0] ?? null;
  const previewMissions = pendingMissions.slice(0, 4);

  const typeIcons: Record<string, string> = {
    photo: "image", headline: "type", quote: "message-square",
    stats: "bar-chart-2", video: "video",
  };
  const diffColor = (d: number) =>
    (["", "#00C851", "#FF9500", "#FF3B30"] as string[])[d];
  const diffLabel = (d: number) =>
    (["", "Kolay", "Orta", "Zor"] as string[])[d];

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingTop: topPadding + 16,
          paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90,
          paddingHorizontal: r.hp,
          gap: 0,
          maxWidth: r.maxW,
          alignSelf: "center" as const,
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              Merhaba, {user.username || "Ajan"} 👋
            </Text>
            <Text style={[styles.title, { color: colors.foreground, fontSize: r.fs(28) }]}>Karargah</Text>
          </View>
          <RankBadge rank={user.rank} size="sm" />
        </Animated.View>

        <StreakCard streak={user.streak} playedToday={user.dailyPlayedToday} />

        <Animated.View
          entering={FadeInDown.delay(130).springify()}
          style={[styles.xpCard, { backgroundColor: colors.card, borderColor: colors.primary + "33" }]}
        >
          <View style={styles.xpCardHeader}>
            <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>Rütbe İlerlemesi</Text>
            <Text style={[styles.xpRankName, { color: colors.primary }]}>{user.rank.name}</Text>
          </View>
          <XPBar
            xp={user.xp}
            progress={user.xpProgress}
            currentRankName={user.rank.name}
            nextRankName={user.nextRank?.name ?? null}
          />
          {user.nextRank && (
            <Text style={[styles.xpHint, { color: colors.mutedForeground }]}>
              {user.nextRank.minXP - user.xp} XP daha → {user.nextRank.name}
            </Text>
          )}
        </Animated.View>

        <View style={[styles.statsRow, { marginTop: 14, marginBottom: 20 }]}>
          {[
            { icon: "check-circle", color: colors.success, value: String(completedMissions.length), label: "Çözüldü" },
            { icon: "crosshair", color: colors.primary, value: `${user.accuracyRate}%`, label: "Doğruluk" },
            { icon: "zap", color: colors.warning, value: String(user.xp), label: "XP" },
          ].map((s, i) => (
            <Animated.View
              key={s.label}
              entering={FadeInDown.delay(160 + i * 40).springify()}
              style={[styles.statBox, { backgroundColor: colors.card, borderColor: s.color + "33" }]}
            >
              <View style={[styles.statIcon, { backgroundColor: s.color + "18" }]}>
                <Feather name={s.icon as any} size={16} color={s.color} />
              </View>
              <Text style={[styles.statVal, { color: colors.foreground, fontSize: r.fs(20) }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
            </Animated.View>
          ))}
        </View>

        {dailyMission && (
          <Animated.View entering={FadeInDown.delay(240).springify()} style={{ marginBottom: 24 }}>
            <View style={styles.sectionHeader}>
              <PulseDot color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Günlük Görev</Text>
              {!user.dailyPlayedToday && (
                <View style={[styles.bonusBadge, { backgroundColor: colors.warning + "22" }]}>
                  <Text style={[styles.bonusBadgeText, { color: colors.warning }]}>2x XP</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={[styles.featuredCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "44" }]}
              onPress={() => router.push("/(tabs)/lab")}
              activeOpacity={0.8}
            >
              <View style={styles.featuredTop}>
                <View style={[styles.featuredIconBox, { backgroundColor: colors.primary + "20" }]}>
                  <Feather name="target" size={28} color={colors.primary} />
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={[styles.featuredTitle, { color: colors.foreground }]} numberOfLines={2}>
                    {dailyMission.title}
                  </Text>
                  <Text style={[styles.featuredDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                    {dailyMission.description}
                  </Text>
                </View>
              </View>
              <View style={styles.featuredFooter}>
                <View style={[styles.diffTag, { backgroundColor: diffColor(dailyMission.difficulty) + "22" }]}>
                  <Text style={[styles.diffTagText, { color: diffColor(dailyMission.difficulty) }]}>
                    {diffLabel(dailyMission.difficulty)}
                  </Text>
                </View>
                <View style={styles.xpTagRow}>
                  <Feather name="zap" size={12} color={colors.warning} />
                  <Text style={[styles.xpTagText, { color: colors.warning }]}>
                    +{dailyMission.xpReward} XP
                  </Text>
                </View>
                <View style={{ flex: 1 }} />
                <View style={styles.startRow}>
                  <Text style={[styles.startText, { color: colors.primary }]}>Başla</Text>
                  <Feather name="arrow-right" size={14} color={colors.primary} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(290).springify()} style={{ marginBottom: 24 }}>
          <View style={styles.sectionHeader}>
            <PulseDot color={colors.warning} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Aktif Vakalar</Text>
            <Text style={[styles.countBadge, { color: colors.mutedForeground }]}>
              {pendingMissions.length} kalan
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: r.hp }}
            style={{ marginHorizontal: -r.hp, paddingHorizontal: r.hp }}
          >
            {previewMissions.map((mission) => (
              <TouchableOpacity
                key={mission.id}
                style={[styles.missionCard, { backgroundColor: colors.card, borderColor: colors.border, width: r.isTablet ? 220 : 185 }]}
                onPress={() => router.push("/(tabs)/lab")}
                activeOpacity={0.78}
              >
                <View style={[styles.missionTypeIcon, { backgroundColor: colors.secondary }]}>
                  <Feather name={typeIcons[mission.type] as any} size={18} color={colors.primary} />
                </View>
                <Text style={[styles.missionTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {mission.title}
                </Text>
                <Text style={[styles.missionCat, { color: colors.mutedForeground }]} numberOfLines={1}>
                  {mission.category}
                </Text>
                <View style={styles.missionCardFooter}>
                  <View style={[styles.diffTag, { backgroundColor: diffColor(mission.difficulty) + "22" }]}>
                    <Text style={[styles.diffTagText, { color: diffColor(mission.difficulty) }]}>
                      {diffLabel(mission.difficulty)}
                    </Text>
                  </View>
                  <View style={styles.xpTagRow}>
                    <Feather name="zap" size={10} color={colors.warning} />
                    <Text style={[styles.missionXP, { color: colors.warning }]}>+{mission.xpReward}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.missionCardMore, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "33" }]}
              onPress={() => router.push("/(tabs)/lab")}
              activeOpacity={0.78}
            >
              <Feather name="layers" size={20} color={colors.primary} />
              <Text style={[styles.missionCardMoreText, { color: colors.primary }]}>Tümü</Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(360).springify()}>
          <View style={styles.sectionHeader}>
            <PulseDot color={colors.success} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Neden Bu Uygulama?</Text>
          </View>
          <View style={{ gap: 8 }}>
            {[
              { icon: "shield", color: colors.primary, title: "Gerçek Beceri Öğren", desc: "Tersine görsel arama, metadata analizi — hayatta kullanacağın teknikler" },
              { icon: "trending-up", color: colors.success, title: "Her Gün İlerle", desc: "Seri sistemi ile her gün oynayarak rütbe kazan, sertifika al" },
              { icon: "zap", color: colors.warning, title: "Haber Kandırmacasına Dur De", desc: "Akıllı olduğunu kanıtla — sahte haberler seni artık kandıramaz" },
            ].map((item, i) => (
              <Animated.View key={item.title} entering={FadeInDown.delay(380 + i * 50).springify()}>
                <View style={[styles.whyCard, { backgroundColor: colors.card, borderColor: item.color + "33" }]}>
                  <View style={[styles.whyIcon, { backgroundColor: item.color + "18" }]}>
                    <Feather name={item.icon as any} size={20} color={item.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.whyTitle, { color: colors.foreground }]}>{item.title}</Text>
                    <Text style={[styles.whyDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 13, marginBottom: 2 },
  title: { fontFamily: "Inter_700Bold", fontSize: 28 },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  streakEmoji: { fontSize: 24 },
  streakTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  streakSub: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  streakBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  streakBadgeNum: { fontFamily: "Inter_700Bold", fontSize: 16, color: "#fff" },
  xpCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  xpCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  xpLabel: { fontFamily: "Inter_400Regular", fontSize: 12 },
  xpRankName: { fontFamily: "Inter_700Bold", fontSize: 14 },
  xpHint: { fontFamily: "Inter_400Regular", fontSize: 12, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 10 },
  statBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 20 },
  statLabel: { fontFamily: "Inter_400Regular", fontSize: 11 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 16, flex: 1 },
  bonusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  bonusBadgeText: { fontFamily: "Inter_700Bold", fontSize: 11 },
  countBadge: { fontFamily: "Inter_400Regular", fontSize: 12 },
  featuredCard: { borderRadius: 18, borderWidth: 1.5, padding: 18, gap: 16 },
  featuredTop: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  featuredIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  featuredTitle: { fontFamily: "Inter_700Bold", fontSize: 16, lineHeight: 22 },
  featuredDesc: { fontFamily: "Inter_400Regular", fontSize: 13, lineHeight: 18 },
  featuredFooter: { flexDirection: "row", alignItems: "center", gap: 10 },
  diffTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  diffTagText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  xpTagRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  xpTagText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  startRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  startText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  missionTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  missionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  missionCat: { fontFamily: "Inter_400Regular", fontSize: 12 },
  missionXP: { fontFamily: "Inter_700Bold", fontSize: 12 },
  whyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  whyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  whyTitle: { fontFamily: "Inter_700Bold", fontSize: 14, marginBottom: 3 },
  whyDesc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  missionCard: {
    width: 185,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  missionCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  missionCardMore: {
    width: 76,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  missionCardMoreText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    textAlign: "center",
  },
});
