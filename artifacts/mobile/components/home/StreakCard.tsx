import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { styles } from "./homeStyles";

interface StreakCardProps {
  streak: number;
  playedToday: boolean;
}

export function StreakCard({ streak, playedToday }: StreakCardProps) {
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
