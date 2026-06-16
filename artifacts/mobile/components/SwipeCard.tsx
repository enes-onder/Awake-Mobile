import React from "react";
import { Animated, useWindowDimensions, View } from "react-native";

import type { Mission } from "@/data/missions";
import { useColors } from "@/hooks/useColors";

import { useSwipeGesture } from "@/components/swipe/useSwipeGesture";
import { SwipeOverlays } from "@/components/swipe/SwipeOverlays";
import { PostContent } from "@/components/swipe/PostContent";
import { CluesArea } from "@/components/swipe/CluesArea";
import { VerdictButtons } from "@/components/swipe/VerdictButtons";
import { styles } from "@/components/swipe/swipeCardStyles";

interface SwipeCardProps {
  mission: Mission;
  clueIndex: number;
  onVerdictSelected: (verdict: "real" | "fake") => void;
  onUseClue: () => void;
}

export function SwipeCard({ mission, clueIndex, onVerdictSelected, onUseClue }: SwipeCardProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const _scale = Math.min(Math.max(width / 390, 0.9), 1.2);
  const fs = (base: number) => Math.round(base * _scale);
  const sp = (base: number) => Math.round(base * Math.min(_scale, 1.1));

  const {
    pan,
    verdictLocked,
    panResponder,
    rotate,
    realOpacity,
    fakeOpacity,
    triggerVerdict,
    showXPPenalty,
    xpPenaltyAnimStyle,
  } = useSwipeGesture({ width, onVerdictSelected });

  const handleUseClueWithFeedback = () => {
    showXPPenalty();
    onUseClue();
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <SwipeOverlays
          verdictLocked={verdictLocked}
          realOpacity={realOpacity}
          fakeOpacity={fakeOpacity}
        />
        <PostContent mission={mission} fs={fs} />
        <CluesArea clues={mission.clues} clueIndex={clueIndex} fs={fs} />
      </Animated.View>

      <VerdictButtons
        clueCount={mission.clues.length}
        clueIndex={clueIndex}
        onUseClue={handleUseClueWithFeedback}
        onVerdictFake={() => triggerVerdict("fake")}
        onVerdictReal={() => triggerVerdict("real")}
        xpPenaltyAnimStyle={xpPenaltyAnimStyle}
        sp={sp}
      />
    </View>
  );
}
