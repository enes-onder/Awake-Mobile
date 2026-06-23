import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { SimChoice, Simulation } from "@/data/simulations";
import { useBottomChromeSpacing } from "@/hooks/useBottomChromeSpacing";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

import { SimTopBar } from "@/components/simulation/SimTopBar";
import { NarrativeStep } from "@/components/simulation/NarrativeStep";
import { ChoiceStep } from "@/components/simulation/ChoiceStep";

interface SimulationPlayerProps {
  simulation: Simulation;
  onComplete: (xpEarned: number) => void;
  onExit: () => void;
}

export function SimulationPlayer({ simulation, onComplete, onExit }: SimulationPlayerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  /** Tab bar (position:absolute) + safe area + dokunma dolgusu */
  const bottomChromeSpacing = useBottomChromeSpacing();
  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [stepIdx, setStepIdx] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming((stepIdx / simulation.steps.length) * 100, { duration: 400 });
  }, [stepIdx]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%` as any,
  }));

  const currentStep = simulation.steps[stepIdx];

  const handleContinue = () => {
    if (stepIdx < simulation.steps.length - 1) {
      setStepIdx((s) => s + 1);
      setSelectedChoiceId(null);
      setShowResult(false);
    } else {
      setIsDone(true);
      onComplete(totalXP);
    }
  };

  const handleChoiceById = (id: string) => {
    const choice = currentStep.choices?.find((c) => c.id === id);
    if (!choice || selectedChoiceId) return;
    setSelectedChoiceId(choice.id);
    setShowResult(true);
    setTotalXP((xp) => xp + choice.xpReward);
    if (Platform.OS !== "web") {
      if (choice.isCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }
  };

  if (isDone) {
    const maxPossible = simulation.xpReward;
    const pct = maxPossible > 0 ? totalXP / maxPossible : 0;
    const stars = pct >= 0.75 ? 3 : pct >= 0.45 ? 2 : 1;

    return (
      <View
        style={[
          { flex: 1, justifyContent: "center", backgroundColor: colors.background },
          {
            paddingTop: topPadding + 20,
            /** useBottomChromeSpacing: tab bar yüksekliği + safe area + dolgu */
            paddingBottom: bottomChromeSpacing,
            paddingHorizontal: r.hp,
          },
        ]}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={[
            {
              backgroundColor: colors.card,
              borderColor: colors.primary + "44",
              borderWidth: 1.5,
              borderRadius: r.sp(24),
              padding: r.sp(28),
              maxWidth: r.maxW,
              alignSelf: "center",
              width: "100%",
              alignItems: "center",
              gap: 18,
            },
          ]}
        >
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[1, 2, 3].map((n) => (
              <Feather
                key={n}
                name="star"
                size={r.sp(32)}
                color={n <= stars ? colors.warning : colors.border}
              />
            ))}
          </View>
          <Text style={{ fontFamily: "Inter_700Bold", fontSize: r.fs(24), color: colors.foreground, textAlign: "center" }}>
            Simülasyon Tamamlandı!
          </Text>
          <Text style={{ fontFamily: "Inter_400Regular", fontSize: r.fs(15), color: colors.mutedForeground, textAlign: "center" }}>
            {simulation.title}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              backgroundColor: colors.warning + "18",
              borderColor: colors.warning + "44",
              borderWidth: 1.5,
              paddingHorizontal: r.sp(20),
              paddingVertical: r.sp(14),
              borderRadius: r.sp(14),
            }}
          >
            <Feather name="zap" size={r.sp(22)} color={colors.warning} />
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: r.fs(18), color: colors.warning }}>
              +{totalXP} XP kazandın
            </Text>
          </View>
          <TouchableOpacity
            style={{
              width: "100%",
              alignItems: "center",
              backgroundColor: colors.primary,
              paddingVertical: r.sp(14),
              borderRadius: r.sp(14),
            }}
            onPress={onExit}
            accessibilityRole="button"
            accessibilityLabel="Haber labına dön"
            accessibilityHint="Simülasyonu kapatır ve haber labına döner"
          >
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: r.fs(16), color: "#fff" }}>
              Devam Et
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  const showContinueBar = currentStep.type === "narrative" || showResult;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: topPadding }}>
      <View style={{ paddingHorizontal: r.hp, paddingVertical: 12 }}>
        <View style={{ maxWidth: r.maxW, alignSelf: "center", width: "100%", flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={onExit}
            style={{
              backgroundColor: colors.secondary,
              width: r.sp(40),
              height: r.sp(40),
              borderRadius: r.sp(20),
              alignItems: "center",
              justifyContent: "center",
            }}
            accessibilityRole="button"
            accessibilityLabel="Simülasyondan çık"
            accessibilityHint="Simülasyonu kapatır ve haber labına döner"
          >
            <Feather name="x" size={r.sp(18)} color={colors.foreground} />
          </TouchableOpacity>

          <View style={{ flex: 1, height: 8, borderRadius: 4, overflow: "hidden", backgroundColor: colors.border }}>
            <Animated.View style={[{ height: "100%", borderRadius: 4, backgroundColor: colors.primary }, progressStyle]} />
          </View>

          <View style={{ backgroundColor: colors.primary + "22", borderRadius: r.sp(8), paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: r.fs(12), color: colors.primary }}>
              {stepIdx + 1}/{simulation.steps.length}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: r.hp, maxWidth: r.maxW, alignSelf: "center", width: "100%", flex: 1, justifyContent: "center", paddingTop: 16, gap: 16 }}>
          {currentStep.type === "narrative" && (
            <NarrativeStep step={currentStep} stepIdx={stepIdx} />
          )}
          {currentStep.type === "choice" && (
            <ChoiceStep
              step={currentStep}
              stepIdx={stepIdx}
              selectedChoiceId={selectedChoiceId}
              showResult={showResult}
              onChoice={handleChoiceById}
            />
          )}
        </View>
      </ScrollView>

      {showContinueBar && (
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={{
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingTop: 12,
            paddingHorizontal: r.hp,
            /** useBottomChromeSpacing: tab bar yüksekliği + safe area + dolgu */
            paddingBottom: bottomChromeSpacing,
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingVertical: r.sp(14),
              borderRadius: r.sp(14),
              maxWidth: r.maxW,
              alignSelf: "center",
              width: "100%",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
            onPress={handleContinue}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={stepIdx < simulation.steps.length - 1 ? "Devam et" : "Simülasyonu bitir"}
            accessibilityHint={stepIdx < simulation.steps.length - 1 ? "Bir sonraki adıma geçer" : "Simülasyonu tamamlar ve sonucu gösterir"}
          >
            <Text style={{ fontFamily: "Inter_700Bold", fontSize: r.fs(16), color: "#fff" }}>
              {stepIdx < simulation.steps.length - 1 ? "Devam Et" : "Bitir"}
            </Text>
            <Feather name="arrow-right" size={r.sp(18)} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
