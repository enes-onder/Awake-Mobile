import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { SwipeCard } from "@/components/SwipeCard";
import { XPFloater } from "@/components/XPFloater";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";
import type { Mission } from "@/data/missions";
import { styles } from "./labStyles";

interface ActiveMissionViewProps {
  activeMission: Mission;
  currentMissionIdx: number;
  pendingMissionsCount: number;
  clueIndex: number;
  celebVisible: boolean;
  celebCorrect: boolean;
  xpFloaterVisible: boolean;
  xpFloaterAmount: number;
  topPadding: number;
  bottomInset: number;
  onBack: () => void;
  onVerdictSelected: (verdict: "real" | "fake") => void;
  onUseClue: () => void;
  onXPFloaterDone: () => void;
}

export function ActiveMissionView({
  activeMission,
  currentMissionIdx,
  pendingMissionsCount,
  clueIndex,
  celebVisible,
  celebCorrect,
  xpFloaterVisible,
  xpFloaterAmount,
  topPadding,
  bottomInset,
  onBack,
  onVerdictSelected,
  onUseClue,
  onXPFloaterDone,
}: ActiveMissionViewProps) {
  const colors = useColors();
  const r = useResponsive();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View
        style={{
          paddingTop: topPadding + 14,
          paddingHorizontal: r.hp,
          paddingBottom: 10,
          gap: 10,
        }}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.activeHeader}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.activeHeaderMeta}>
            <Text
              style={[styles.activeTitle, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {activeMission.title}
            </Text>
            <Text style={[styles.activeSub, { color: colors.mutedForeground }]}>
              {currentMissionIdx + 1}/{pendingMissionsCount} · Vaka Analizi
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(60).springify()}
          style={[
            styles.instructionBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>
            Kaydır:{" "}
            <Text style={{ color: colors.success, fontFamily: "Inter_700Bold" }}>
              Sağ = Doğru
            </Text>
            {"  "}
            <Text style={{ color: colors.fake, fontFamily: "Inter_700Bold" }}>
              Sol = Yanlış
            </Text>
          </Text>
        </Animated.View>
      </View>

      <View
        style={{
          flex: 1,
          paddingHorizontal: r.hp,
          justifyContent: "center",
          paddingBottom: Platform.OS === "web" ? 100 : bottomInset + 16,
          maxWidth: r.maxW,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <SwipeCard
            key={activeMission.id}
            mission={activeMission}
            clueIndex={clueIndex}
            onVerdictSelected={onVerdictSelected}
            onUseClue={onUseClue}
          />
        </Animated.View>
      </View>

      <CelebrationOverlay
        visible={celebVisible}
        isCorrect={celebCorrect}
        message={celebCorrect ? "Doğru Tespit!" : "Yanış Tahmin"}
        subMessage={
          celebCorrect ? "Harika iş, ajan!" : "Dezenformasyon bu sefer kazandı"
        }
      />
      <XPFloater
        visible={xpFloaterVisible}
        amount={xpFloaterAmount}
        onDone={onXPFloaterDone}
      />
    </View>
  );
}
