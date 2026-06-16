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
  const [showBonus, setShowBonus] = useState(false);
  const bonusShownRef = useRef(false);

  useEffect(() => {
    if (user.streakBonusEarned > 0 && !bonusShownRef.current) {
      bonusShownRef.current = true;
      setShowBonus(true);
    }
  }, [user.streakBonusEarned]);

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const pendingMissions = missions.filter((m) => !user.completedMissions.includes(m.id));
  const completedCount = missions.filter((m) => user.completedMissions.includes(m.id)).length;
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
