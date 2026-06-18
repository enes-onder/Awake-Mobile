/**
 * (tabs)/index.tsx — Karargah (Ana Sayfa) ekranı.
 *
 * Kullanıcının günlük durumunu tek bakışta gösterir:
 *  - Streak ve günlük bonus durumu (StreakCard)
 *  - XP ilerleme çubuğu ve mevcut rütbe (XPProgressCard)
 *  - Özet istatistikler: tamamlanan vaka, doğruluk, XP (StatsRow)
 *  - Günün önerilen vakası (DailyMissionCard)
 *  - Bekleyen vakalar listesi (ActiveMissionsList)
 *
 * Uygulama açılışında streak bonus XP kazanıldıysa toast bildirimi gösterilir.
 */

import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RankBadge } from "@/components/RankBadge";
import { useUser } from "@/context/UserContext";
import { useContent } from "@/context/ContentContext";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

import { StreakBonusToast } from "@/components/home/StreakBonusToast";
import { StreakCard } from "@/components/home/StreakCard";
import { XPProgressCard } from "@/components/home/XPProgressCard";
import { StatsRow } from "@/components/home/StatsRow";
import { DailyMissionCard } from "@/components/home/DailyMissionCard";
import { ActiveMissionsList } from "@/components/home/ActiveMissionsList";
import { styles } from "@/components/home/homeStyles";

export default function KarargahScreen() {
  const colors = useColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const { missions } = useContent();

  /** Streak bonus toast'unun görünürlüğü */
  const [showBonus, setShowBonus] = useState(false);
  /** Aynı oturumda birden fazla toast göstermemek için guard */
  const bonusShownRef = useRef(false);

  /** Streak bonus kazanıldıysa ve henüz gösterilmediyse toast'u tetikle */
  useEffect(() => {
    if (user.streakBonusEarned > 0 && !bonusShownRef.current) {
      bonusShownRef.current = true;
      setShowBonus(true);
    }
  }, [user.streakBonusEarned]);

  /** Web'de navigasyon çubuğu yüksekliği için minimum 67px üst boşluk */
  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const pendingMissions = missions.filter((m) => !user.completedMissions.includes(m.id));
  const completedCount = missions.filter((m) => user.completedMissions.includes(m.id)).length;
  /** Günün önerilen vakası: henüz tamamlanmamış ilk vaka */
  const dailyMission = pendingMissions[0] ?? null;

  return (
    <>
      {showBonus && (
        <StreakBonusToast xp={user.streakBonusEarned} onDone={() => setShowBonus(false)} />
      )}
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
        {/* Başlık satırı: selamlama metni + rütbe rozeti */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
              Merhaba, {user.username || "Ajan"} 👋
            </Text>
            <Text style={[styles.title, { color: colors.foreground, fontSize: r.fs(28) }]}>
              Karargah
            </Text>
          </View>
          <RankBadge rank={user.rank} size="sm" />
        </Animated.View>

        <StreakCard streak={user.streak} playedToday={user.dailyPlayedToday} />

        <XPProgressCard
          xp={user.xp}
          progress={user.xpProgress}
          rank={user.rank}
          nextRank={user.nextRank}
        />

        <StatsRow
          completedCount={completedCount}
          accuracyRate={user.accuracyRate}
          xp={user.xp}
        />

        {/* Yalnızca bekleyen vaka varsa günün vakasını göster */}
        {dailyMission && (
          <DailyMissionCard
            mission={dailyMission}
            dailyPlayedToday={user.dailyPlayedToday}
          />
        )}

        <ActiveMissionsList
          missions={pendingMissions}
          pendingCount={pendingMissions.length}
        />
      </ScrollView>
    </>
  );
}
