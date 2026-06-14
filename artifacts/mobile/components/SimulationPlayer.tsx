import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
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
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { SimChoice, Simulation } from "@/data/simulations";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

interface SimulationPlayerProps {
  simulation: Simulation;
  onComplete: (xpEarned: number) => void;
  onExit: () => void;
}


function AnimatedChoiceButton({
  choice,
  onPress,
  selected,
  showResult,
}: {
  choice: SimChoice;
  onPress: () => void;
  selected: boolean;
  showResult: boolean;
  delay: number;
}) {
  const colors = useColors();
  const r = useResponsive();

  let borderColor = colors.border;
  let bgColor = colors.card;
  let textColor = colors.foreground;
  let icon: "check" | "x" | null = null;

  if (showResult) {
    if (choice.isCorrect) {
      borderColor = colors.success;
      bgColor = colors.success + "18";
      textColor = colors.success;
      icon = "check";
    } else if (selected && !choice.isCorrect) {
      borderColor = colors.fake;
      bgColor = colors.fake + "18";
      textColor = colors.fake;
      icon = "x";
    } else {
      borderColor = colors.border;
      bgColor = colors.card;
      textColor = colors.mutedForeground;
    }
  }

  return (
    <TouchableOpacity
      style={[
        styles.choiceBtn,
        {
          backgroundColor: bgColor,
          borderColor,
          padding: r.sp(16),
          borderRadius: r.sp(14),
        },
      ]}
      onPress={onPress}
      disabled={showResult}
      activeOpacity={0.85}
    >
      <Text
        style={[
          styles.choiceBtnText,
          { color: textColor, fontSize: r.fs(15), lineHeight: r.fs(23) },
        ]}
        numberOfLines={4}
      >
        {choice.text}
      </Text>
      {showResult && icon && (
        <Feather
          name={icon}
          size={r.sp(20)}
          color={choice.isCorrect ? colors.success : colors.fake}
        />
      )}
    </TouchableOpacity>
  );
}

export function SimulationPlayer({
  simulation,
  onComplete,
  onExit,
}: SimulationPlayerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const r = useResponsive();
  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [stepIdx, setStepIdx] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withTiming(stepIdx / simulation.steps.length, {
      duration: 400,
    });
  }, [stepIdx]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value * 100}%` as any,
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

  const handleChoiceSelect = (choice: SimChoice) => {
    if (selectedChoiceId) return;
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

  const selectedChoice = currentStep.choices?.find(
    (c) => c.id === selectedChoiceId
  );

  if (isDone) {
    const maxPossible = simulation.xpReward;
    const pct = maxPossible > 0 ? totalXP / maxPossible : 0;
    const stars = pct >= 0.75 ? 3 : pct >= 0.45 ? 2 : 1;

    return (
      <View
        style={[
          styles.doneContainer,
          {
            backgroundColor: colors.background,
            paddingTop: topPadding + 20,
            paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 32,
            paddingHorizontal: r.hp,
          },
        ]}
      >
        <Animated.View
          entering={FadeInDown.springify()}
          style={[
            styles.doneCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.primary + "44",
              padding: r.sp(28),
              borderRadius: r.sp(24),
              maxWidth: r.maxW,
              alignSelf: "center",
              width: "100%",
            },
          ]}
        >
          <View style={styles.starsRow}>
            {[1, 2, 3].map((n) => (
              <Feather
                key={n}
                name="star"
                size={r.sp(32)}
                color={n <= stars ? colors.warning : colors.border}
              />
            ))}
          </View>
          <Text style={[styles.doneTitle, { color: colors.foreground, fontSize: r.fs(24) }]}>
            Simülasyon Tamamlandı!
          </Text>
          <Text style={[styles.doneSub, { color: colors.mutedForeground, fontSize: r.fs(15) }]}>
            {simulation.title}
          </Text>
          <View
            style={[
              styles.xpBox,
              {
                backgroundColor: colors.warning + "18",
                borderColor: colors.warning + "44",
                paddingHorizontal: r.sp(20),
                paddingVertical: r.sp(14),
                borderRadius: r.sp(14),
              },
            ]}
          >
            <Feather name="zap" size={r.sp(22)} color={colors.warning} />
            <Text style={[styles.xpBoxText, { color: colors.warning, fontSize: r.fs(18) }]}>
              +{totalXP} XP kazandın
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.doneBtn,
              {
                backgroundColor: colors.primary,
                paddingVertical: r.sp(14),
                borderRadius: r.sp(14),
              },
            ]}
            onPress={onExit}
          >
            <Text style={[styles.doneBtnText, { fontSize: r.fs(16) }]}>Devam Et</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  const showContinueBar = currentStep.type === "narrative" || showResult;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: topPadding },
      ]}
    >
      {/* Top bar */}
      <View style={[styles.topBarOuter, { paddingHorizontal: r.hp }]}>
        <View
          style={[
            styles.topBar,
            { maxWidth: r.maxW, alignSelf: "center", width: "100%" },
          ]}
        >
          <TouchableOpacity
            onPress={onExit}
            style={[
              styles.closeBtn,
              {
                backgroundColor: colors.secondary,
                width: r.sp(40),
                height: r.sp(40),
                borderRadius: r.sp(20),
              },
            ]}
          >
            <Feather name="x" size={r.sp(18)} color={colors.foreground} />
          </TouchableOpacity>
          <View
            style={[styles.progressTrack, { backgroundColor: colors.border }]}
          >
            <Animated.View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary },
                progressStyle,
              ]}
            />
          </View>
          <View
            style={[
              styles.stepCounter,
              { backgroundColor: colors.primary + "22", borderRadius: r.sp(8) },
            ]}
          >
            <Text
              style={[
                styles.stepCounterText,
                { color: colors.primary, fontSize: r.fs(12) },
              ]}
            >
              {stepIdx + 1}/{simulation.steps.length}
            </Text>
          </View>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.contentInner,
            {
              paddingHorizontal: r.hp,
              maxWidth: r.maxW,
              alignSelf: "center",
              width: "100%",
              flex: 1,
              justifyContent: "center",
            },
          ]}
        >
          {currentStep.type === "narrative" && (
            <Animated.View
              key={`narrative-${stepIdx}`}
              entering={FadeInDown.springify()}
              style={[
                styles.narrativeCard,
                {
                  backgroundColor: colors.primary + "12",
                  borderColor: colors.primary + "33",
                  padding: r.sp(22),
                  borderRadius: r.sp(20),
                },
              ]}
            >
              <View
                style={[
                  styles.narrativeIcon,
                  {
                    width: r.sp(44),
                    height: r.sp(44),
                    borderRadius: r.sp(22),
                  },
                ]}
              >
                <Feather
                  name="message-circle"
                  size={r.sp(22)}
                  color={colors.primary}
                />
              </View>
              <Text
                style={[
                  styles.narrativeText,
                  {
                    color: colors.foreground,
                    fontSize: r.fs(16),
                    lineHeight: r.fs(26),
                  },
                ]}
              >
                {currentStep.text}
              </Text>
            </Animated.View>
          )}

          {currentStep.type === "choice" && (
            <Animated.View
              key={`choice-${stepIdx}`}
              entering={FadeInDown.springify()}
              style={styles.choiceSection}
            >
              <Text
                style={[
                  styles.questionText,
                  {
                    color: colors.foreground,
                    fontSize: r.fs(18),
                    lineHeight: r.fs(28),
                  },
                ]}
              >
                {currentStep.text}
              </Text>
              <View style={[styles.choicesList, { gap: r.sp(10) }]}>
                {currentStep.choices!.map((choice, i) => (
                  <AnimatedChoiceButton
                    key={choice.id}
                    choice={choice}
                    onPress={() => handleChoiceSelect(choice)}
                    selected={selectedChoiceId === choice.id}
                    showResult={showResult}
                    delay={i * 80}
                  />
                ))}
              </View>

              {showResult && selectedChoice && (
                <Animated.View
                  entering={FadeInUp.springify()}
                  style={[
                    styles.explanationCard,
                    {
                      backgroundColor: selectedChoice.isCorrect
                        ? colors.success + "12"
                        : colors.fake + "12",
                      borderColor: selectedChoice.isCorrect
                        ? colors.success + "44"
                        : colors.fake + "44",
                      padding: r.sp(14),
                      borderRadius: r.sp(14),
                    },
                  ]}
                >
                  <View style={styles.explanationHeader}>
                    <Feather
                      name={
                        selectedChoice.isCorrect ? "check-circle" : "info"
                      }
                      size={r.sp(16)}
                      color={
                        selectedChoice.isCorrect ? colors.success : colors.fake
                      }
                    />
                    <Text
                      style={[
                        styles.explanationLabel,
                        {
                          color: selectedChoice.isCorrect
                            ? colors.success
                            : colors.fake,
                          fontSize: r.fs(14),
                        },
                      ]}
                    >
                      {selectedChoice.isCorrect
                        ? "Doğru Karar!"
                        : "Yanış Karar"}
                    </Text>
                    {selectedChoice.xpReward > 0 && (
                      <View style={styles.xpPill}>
                        <Feather
                          name="zap"
                          size={r.sp(11)}
                          color={colors.warning}
                        />
                        <Text
                          style={[
                            styles.xpPillText,
                            {
                              color: colors.warning,
                              fontSize: r.fs(12),
                            },
                          ]}
                        >
                          +{selectedChoice.xpReward}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.explanationText,
                      {
                        color: colors.foreground,
                        fontSize: r.fs(14),
                        lineHeight: r.fs(22),
                      },
                    ]}
                  >
                    {selectedChoice.explanation}
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Continue bar — NOT absolute, sits naturally at bottom */}
      {showContinueBar && (
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          style={[
            styles.continueBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingHorizontal: r.hp,
              paddingBottom:
                Platform.OS === "web" ? 100 : insets.bottom + 16,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.continueBtn,
              {
                backgroundColor: colors.primary,
                paddingVertical: r.sp(14),
                borderRadius: r.sp(14),
                maxWidth: r.maxW,
                alignSelf: "center",
                width: "100%",
              },
            ]}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={[styles.continueBtnText, { fontSize: r.fs(16) }]}>
              {stepIdx < simulation.steps.length - 1 ? "Devam Et" : "Bitir"}
            </Text>
            <Feather name="arrow-right" size={r.sp(18)} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBarOuter: {
    paddingVertical: 12,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  closeBtn: {
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  stepCounter: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  stepCounterText: {
    fontFamily: "Inter_700Bold",
  },
  scrollArea: {
    flex: 1,
  },
  contentInner: {
    paddingTop: 16,
    gap: 16,
  },
  narrativeCard: {
    borderWidth: 1.5,
    gap: 14,
  },
  narrativeIcon: {
    backgroundColor: "rgba(43,127,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  narrativeText: {
    fontFamily: "Inter_400Regular",
  },
  choiceSection: {
    gap: 14,
  },
  questionText: {
    fontFamily: "Inter_700Bold",
  },
  choicesList: {},
  choiceBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1.5,
  },
  choiceBtnText: {
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  explanationCard: {
    borderWidth: 1.5,
    gap: 8,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  explanationLabel: {
    fontFamily: "Inter_700Bold",
    flex: 1,
  },
  xpPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  xpPillText: {
    fontFamily: "Inter_700Bold",
  },
  explanationText: {
    fontFamily: "Inter_400Regular",
  },
  continueBar: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  continueBtnText: {
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  doneContainer: {
    flex: 1,
    justifyContent: "center",
  },
  doneCard: {
    borderWidth: 1.5,
    alignItems: "center",
    gap: 18,
  },
  starsRow: {
    flexDirection: "row",
    gap: 8,
  },
  doneTitle: {
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  doneSub: {
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  xpBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1.5,
  },
  xpBoxText: {
    fontFamily: "Inter_700Bold",
  },
  doneBtn: {
    width: "100%",
    alignItems: "center",
  },
  doneBtnText: {
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
});
