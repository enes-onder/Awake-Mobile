import { Feather } from "@expo/vector-icons";
import React from "react";
import { Animated, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { styles } from "./swipeCardStyles";

interface SwipeOverlaysProps {
  verdictLocked: "real" | "fake" | null;
  realOpacity: Animated.AnimatedInterpolation<string | number>;
  fakeOpacity: Animated.AnimatedInterpolation<string | number>;
}

export function SwipeOverlays({ verdictLocked, realOpacity, fakeOpacity }: SwipeOverlaysProps) {
  const colors = useColors();

  return (
    <>
      {!verdictLocked && (
        <>
          <Animated.View
            style={[styles.verdictOverlay, styles.realOverlay, { opacity: realOpacity }]}
          >
            <Text style={[styles.verdictText, { color: colors.real }]}>DOĞRU ✓</Text>
          </Animated.View>
          <Animated.View
            style={[styles.verdictOverlay, styles.fakeOverlay, { opacity: fakeOpacity }]}
          >
            <Text style={[styles.verdictText, { color: colors.fake }]}>✗ YANLIŞ</Text>
          </Animated.View>
        </>
      )}

      {verdictLocked && (
        <View
          style={[
            styles.lockedStamp,
            { backgroundColor: verdictLocked === "real" ? "#00C85128" : "#FF3B3028", borderRadius: 18 },
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
              { color: verdictLocked === "real" ? "#00C851" : "#FF3B30" },
            ]}
          >
            {verdictLocked === "real" ? "DOĞRU" : "YANLIŞ"}
          </Text>
        </View>
      )}
    </>
  );
}
