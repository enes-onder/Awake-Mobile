import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  PanResponder,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import type { Mission } from "@/data/missions";
import { useColors } from "@/hooks/useColors";

const PLATFORM_ICONS: Record<string, string> = {
  twitter: "twitter",
  instagram: "instagram",
  whatsapp: "message-circle",
  telegram: "send",
  news: "globe",
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "#1DA1F2",
  instagram: "#E1306C",
  whatsapp: "#25D366",
  telegram: "#0088CC",
  news: "#FF9500",
};

interface SwipeCardProps {
  mission: Mission;
  clueIndex: number;
  onVerdictSelected: (verdict: "real" | "fake") => void;
  onUseClue: () => void;
}

export function SwipeCard({
  mission,
  clueIndex,
  onVerdictSelected,
  onUseClue,
}: SwipeCardProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const _scale = Math.min(Math.max(width / 390, 0.9), 1.2);
  const fs = (base: number) => Math.round(base * _scale);
  const sp = (base: number) => Math.round(base * Math.min(_scale, 1.1));
  const pan = useRef(new Animated.ValueXY()).current;
  const [swiping, setSwiping] = useState<"real" | "fake" | null>(null);
  const [verdictLocked, setVerdictLocked] = useState<"real" | "fake" | null>(null);
  const verdictLockedRef = useRef(false);

  const SWIPE_THRESHOLD = 55;

  const triggerVerdict = (verdict: "real" | "fake") => {
    if (verdictLockedRef.current) return;
    verdictLockedRef.current = true;
    setVerdictLocked(verdict);
    setSwiping(null);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    setTimeout(() => {
      const toX = verdict === "real" ? 520 : -520;
      Animated.timing(pan, {
        toValue: { x: toX, y: -40 },
        duration: 320,
        useNativeDriver: false,
      }).start(() => {
        pan.setValue({ x: 0, y: 0 });
        verdictLockedRef.current = false;
        setVerdictLocked(null);
        onVerdictSelected(verdict);
      });
    }, 380);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !verdictLockedRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        !verdictLockedRef.current && Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (_, gestureState) => {
        if (verdictLockedRef.current) return;
        pan.setValue({ x: gestureState.dx, y: gestureState.dy * 0.2 });
        if (gestureState.dx > 40) setSwiping("real");
        else if (gestureState.dx < -40) setSwiping("fake");
        else setSwiping(null);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (verdictLockedRef.current) return;
        setSwiping(null);

        const isFlickRight = gestureState.vx > 0.35 && gestureState.dx > 10;
        const isFlickLeft = gestureState.vx < -0.35 && gestureState.dx < -10;

        if (gestureState.dx > SWIPE_THRESHOLD || isFlickRight) {
          triggerVerdict("real");
        } else if (gestureState.dx < -SWIPE_THRESHOLD || isFlickLeft) {
          triggerVerdict("fake");
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 7,
            tension: 80,
          }).start();
        }
      },
    })
  ).current;

  const rotate = pan.x.interpolate({
    inputRange: [-200, 0, 200],
    outputRange: ["-14deg", "0deg", "14deg"],
    extrapolate: "clamp",
  });

  const realOpacity = pan.x.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const fakeOpacity = pan.x.interpolate({
    inputRange: [-60, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const platformColor =
    PLATFORM_COLORS[mission.content.platform] || colors.primary;

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { rotate },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Drag-based overlays */}
        {!verdictLocked && (
          <>
            <Animated.View
              style={[
                styles.verdictOverlay,
                styles.realOverlay,
                { opacity: realOpacity },
              ]}
            >
              <Text style={[styles.verdictText, { color: colors.real }]}>
                DOĞRU ✓
              </Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.verdictOverlay,
                styles.fakeOverlay,
                { opacity: fakeOpacity },
              ]}
            >
              <Text style={[styles.verdictText, { color: colors.fake }]}>
                ✗ YANLIŞ
              </Text>
            </Animated.View>
          </>
        )}

        {/* Big locked stamp — shown after verdict committed */}
        {verdictLocked && (
          <View
            style={[
              styles.lockedStamp,
              {
                backgroundColor:
                  verdictLocked === "real" ? "#00C85128" : "#FF3B3028",
                borderRadius: 18,
              },
            ]}
          >
            <Feather
              name={verdictLocked === "real" ? "check-circle" : "x-circle"}
              size={88}
              color={verdictLocked === "real" ? "#00C851" : "#FF3B30"}
            />
            <Text
              style={[
                styles.stampLabel,
                {
                  color:
                    verdictLocked === "real" ? "#00C851" : "#FF3B30",
                },
              ]}
            >
              {verdictLocked === "real" ? "DOĞRU" : "YANLIŞ"}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.platformBar,
            { backgroundColor: platformColor + "18" },
          ]}
        >
          <Feather
            name={PLATFORM_ICONS[mission.content.platform] as any}
            size={14}
            color={platformColor}
          />
          <Text style={[styles.platformName, { color: platformColor }]}>
            {mission.content.platform.toUpperCase()}
          </Text>
          <View style={styles.platformRight}>
            <View
              style={[
                styles.categoryTag,
                { backgroundColor: colors.secondary },
              ]}
            >
              <Text
                style={[styles.categoryText, { color: colors.mutedForeground }]}
              >
                {mission.category}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.postHeader}>
          <View
            style={[styles.avatar, { backgroundColor: colors.primary + "33" }]}
          >
            <Feather name="user" size={18} color={colors.primary} />
          </View>
          <View style={styles.postHeaderText}>
            <Text style={[styles.accountName, { color: colors.foreground, fontSize: fs(14) }]}>
              {mission.content.accountName}
            </Text>
            <Text
              style={[styles.accountHandle, { color: colors.mutedForeground, fontSize: fs(12) }]}
            >
              {mission.content.accountHandle} · {mission.content.timestamp}
            </Text>
          </View>
        </View>

        <Text style={[styles.postText, { color: colors.foreground, fontSize: fs(15), lineHeight: fs(23) }]}>
          {mission.content.text}
        </Text>

        {mission.content.imageTag && (
          <View
            style={[
              styles.imageTag,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Feather name="image" size={16} color={colors.mutedForeground} />
            <Text style={[styles.imageTagText, { color: colors.mutedForeground }]}>
              {mission.content.imageTag}
            </Text>
          </View>
        )}

        <View
          style={[styles.statsRow, { borderTopColor: colors.border }]}
        >
          <View style={styles.stat}>
            <Feather name="heart" size={13} color={colors.mutedForeground} />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {mission.content.likes || "—"}
            </Text>
          </View>
          <View style={styles.stat}>
            <Feather
              name="repeat"
              size={13}
              color={colors.mutedForeground}
            />
            <Text style={[styles.statText, { color: colors.mutedForeground }]}>
              {mission.content.shares}
            </Text>
          </View>
        </View>

        {clueIndex > 0 && (
          <View style={[styles.cluesArea, { borderTopColor: colors.border }]}>
            {mission.clues.slice(0, clueIndex).map((clue, i) => (
              <View
                key={i}
                style={[
                  styles.clue,
                  { backgroundColor: colors.primary + "12" },
                ]}
              >
                <Feather name="info" size={12} color={colors.primary} />
                <Text style={[styles.clueText, { color: colors.foreground, fontSize: fs(13) }]}>
                  {clue}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      <View style={styles.hintRow}>
        {clueIndex < mission.clues.length ? (
          <TouchableOpacity
            onPress={onUseClue}
            style={[
              styles.hintBtn,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Feather name="search" size={14} color={colors.primary} />
            <Text style={[styles.hintText, { color: colors.primary }]}>
              İpucu Al ({mission.clues.length - clueIndex} kalan)
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.hintBtn,
              { backgroundColor: colors.success + "18", borderColor: colors.success + "44" },
            ]}
          >
            <Feather name="check" size={14} color={colors.success} />
            <Text style={[styles.hintText, { color: colors.success }]}>
              Tüm ipuçları kullanıldı
            </Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[
            styles.verdictBtn,
            styles.fakeBtn,
            { backgroundColor: colors.fake + "18", borderColor: colors.fake, paddingVertical: sp(14) },
          ]}
          onPress={() => triggerVerdict("fake")}
          activeOpacity={0.8}
        >
          <Feather name="x" size={20} color={colors.fake} />
          <Text style={[styles.verdictBtnText, { color: colors.fake }]}>
            YANLIŞ
          </Text>
        </TouchableOpacity>

        <View style={styles.swipeHint}>
          <Feather name="move" size={14} color={colors.mutedForeground} />
        </View>

        <TouchableOpacity
          style={[
            styles.verdictBtn,
            styles.realBtn,
            { backgroundColor: colors.real + "18", borderColor: colors.real, paddingVertical: sp(14) },
          ]}
          onPress={() => triggerVerdict("real")}
          activeOpacity={0.8}
        >
          <Feather name="check" size={20} color={colors.real} />
          <Text style={[styles.verdictBtnText, { color: colors.real }]}>
            DOĞRU
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: 14,
  },
  card: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    ...Platform.select({
      web: { boxShadow: "0 8px 24px rgba(0,0,0,0.35)" } as any,
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 10,
      },
    }),
  },
  lockedStamp: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    zIndex: 20,
  },
  stampLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 40,
    letterSpacing: 5,
  },
  verdictOverlay: {
    position: "absolute",
    top: 18,
    zIndex: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 2.5,
  },
  realOverlay: {
    right: 14,
    borderColor: "#00C851",
    backgroundColor: "#00C85120",
    transform: [{ rotate: "10deg" }],
  },
  fakeOverlay: {
    left: 14,
    borderColor: "#FF3B30",
    backgroundColor: "#FF3B3020",
    transform: [{ rotate: "-10deg" }],
  },
  verdictText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    letterSpacing: 2,
  },
  platformBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  platformName: {
    fontFamily: "Inter_700Bold",
    fontSize: 11,
    letterSpacing: 1,
  },
  platformRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontFamily: "Inter_500Medium",
    fontSize: 10,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  postHeaderText: {
    flex: 1,
  },
  accountName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  accountHandle: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 1,
  },
  postText: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 23,
  },
  imageTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  imageTagText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    gap: 18,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
  },
  cluesArea: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  clue: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 8,
  },
  clueText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
    flex: 1,
  },
  hintRow: {
    width: "100%",
  },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  hintText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    alignItems: "center",
  },
  verdictBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
  },
  fakeBtn: {},
  realBtn: {},
  verdictBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
    letterSpacing: 1,
  },
  swipeHint: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
});
