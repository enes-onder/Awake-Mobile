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
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BadgeCard } from "@/components/BadgeCard";
import { XPFloater } from "@/components/XPFloater";
import { useUser } from "@/context/UserContext";
import { useContent } from "@/context/ContentContext";
import { type Lesson } from "@/data/lessons";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

function ProgressBar({ current, total, color }: { current: number; total: number; color: string }) {
  const progress = useSharedValue(0);
  const colors = useColors();

  React.useEffect(() => {
    progress.value = withTiming(current / total, { duration: 400 });
  }, [current, total]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%` as any,
  }));

  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
      <Animated.View style={[styles.progressFill, { backgroundColor: color }, fillStyle]} />
    </View>
  );
}

function QuizOption({
  text,
  index,
  selected,
  correctIdx,
  showResult,
  onPress,
}: {
  text: string;
  index: number;
  selected: number | null;
  correctIdx: number;
  showResult: boolean;
  onPress: () => void;
  delay: number;
}) {
  const colors = useColors();

  let borderColor = colors.border;
  let bgColor = colors.card;
  let textColor = colors.foreground;
  let icon: "check" | "x" | null = null;

  if (showResult) {
    if (index === correctIdx) {
      borderColor = colors.success;
      bgColor = colors.success + "18";
      textColor = colors.success;
      icon = "check";
    } else if (index === selected && index !== correctIdx) {
      borderColor = colors.fake;
      bgColor = colors.fake + "18";
      textColor = colors.fake;
      icon = "x";
    } else {
      textColor = colors.mutedForeground;
    }
  } else if (selected === index) {
    borderColor = colors.primary;
    bgColor = colors.primary + "18";
    textColor = colors.primary;
  }

  return (
    <TouchableOpacity
      style={[styles.quizOption, { backgroundColor: bgColor, borderColor }]}
      onPress={onPress}
      disabled={showResult}
      activeOpacity={0.8}
    >
      <View style={[styles.optionLetter, { backgroundColor: borderColor + "22" }]}>
        <Text style={[styles.optionLetterText, { color: borderColor }]}>
          {["A", "B", "C", "D"][index]}
        </Text>
      </View>
      <Text style={[styles.quizOptionText, { color: textColor }]} numberOfLines={3}>
        {text}
      </Text>
      {showResult && icon && (
        <Feather name={icon} size={16} color={index === correctIdx ? colors.success : colors.fake} />
      )}
    </TouchableOpacity>
  );
}


function LessonPlayer({
  lesson,
  onComplete,
  onExit,
}: {
  lesson: Lesson;
  onComplete: (xp: number) => void;
  onExit: () => void;
}) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const r = useResponsive();
  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [phase, setPhase] = useState<"content" | "quiz" | "done">("content");
  const [contentIdx, setContentIdx] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [bonusXP, setBonusXP] = useState(0);

  const totalSteps = lesson.content.length + lesson.quiz.length;
  const currentStep = phase === "content"
    ? contentIdx
    : phase === "quiz"
    ? lesson.content.length + quizIdx
    : totalSteps;

  const currentQuiz = lesson.quiz[quizIdx];

  const handleContentNext = () => {
    if (contentIdx < lesson.content.length - 1) {
      setContentIdx(c => c + 1);
    } else {
      setPhase("quiz");
    }
  };

  const handleSelectAnswer = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const isCorrect = idx === currentQuiz.correctIdx;
    if (isCorrect) {
      setBonusXP(prev => prev + 10);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      user.earnXP(-10);
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleQuizNext = () => {
    if (quizIdx < lesson.quiz.length - 1) {
      setQuizIdx(q => q + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setPhase("done");
    }
  };

  const totalXP = lesson.xpReward + bonusXP;

  useEffect(() => {
    if (phase === "done") {
      const timer = setTimeout(() => {
        onComplete(totalXP);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <View style={[styles.playerContainer, { backgroundColor: colors.background, paddingTop: topPadding }]}>
      {/* Top bar */}
      <View style={[styles.playerTopBar, { paddingHorizontal: r.hp }]}>
        <View style={{ maxWidth: r.maxW, alignSelf: "center", width: "100%", flexDirection: "row", alignItems: "center", gap: 10 }}>
          <TouchableOpacity
            onPress={onExit}
            style={[styles.playerCloseBtn, { backgroundColor: colors.secondary, width: r.sp(38), height: r.sp(38), borderRadius: r.sp(19) }]}
          >
            <Feather name="x" size={r.sp(18)} color={colors.foreground} />
          </TouchableOpacity>
          <ProgressBar
            current={currentStep}
            total={totalSteps}
            color={lesson.color}
          />
          <View style={[styles.stepBadge, { backgroundColor: lesson.color + "22" }]}>
            <Text style={[styles.stepBadgeText, { color: lesson.color, fontSize: r.fs(12) }]}>
              {currentStep}/{totalSteps}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flex: 1, overflow: "hidden" }}>
      {phase === "content" && (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 24, flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ maxWidth: r.maxW, alignSelf: "center", width: "100%", paddingHorizontal: r.hp, paddingTop: 16, flex: 1, justifyContent: "center", gap: r.sp(20), paddingVertical: 24 }}>
              <View style={[styles.lessonIconBig, { backgroundColor: lesson.color + "18", width: r.sp(72), height: r.sp(72), borderRadius: r.sp(20) }]}>
                <Feather name={lesson.icon as any} size={r.sp(36)} color={lesson.color} />
              </View>
              <Text style={[styles.lessonStepLabel, { color: lesson.color, fontSize: r.fs(13) }]}>
                Ders · {contentIdx + 1}/{lesson.content.length}
              </Text>
              <Text style={[styles.contentText, { color: colors.foreground, fontSize: r.fs(17), lineHeight: r.fs(28) }]}>
                {lesson.content[contentIdx]}
              </Text>
            </View>
          </ScrollView>
        </View>
      )}

      {phase === "quiz" && currentQuiz && (
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ maxWidth: r.maxW, alignSelf: "center", width: "100%", paddingHorizontal: r.hp, paddingTop: 16, gap: r.sp(16) }}>
              <View style={[styles.quizHeader, { backgroundColor: colors.primary + "14" }]}>
                <Feather name="help-circle" size={r.sp(18)} color={colors.primary} />
                <Text style={[styles.quizHeaderText, { color: colors.primary, fontSize: r.fs(13) }]}>
                  Quiz · {quizIdx + 1}/{lesson.quiz.length}
                </Text>
              </View>
              <Text style={[styles.quizQuestion, { color: colors.foreground, fontSize: r.fs(18), lineHeight: r.fs(28) }]}>
                {currentQuiz.question}
              </Text>
              <View style={[styles.quizOptions, { gap: r.sp(10) }]}>
                {currentQuiz.options.map((opt, i) => (
                  <QuizOption
                    key={i}
                    text={opt}
                    index={i}
                    selected={selected}
                    correctIdx={currentQuiz.correctIdx}
                    showResult={showResult}
                    onPress={() => handleSelectAnswer(i)}
                    delay={i * 70}
                  />
                ))}
              </View>
              {showResult && (
                <View
                  style={[
                    styles.explanationBox,
                    {
                      backgroundColor:
                        selected === currentQuiz.correctIdx
                          ? colors.success + "12"
                          : colors.fake + "12",
                      borderColor:
                        selected === currentQuiz.correctIdx
                          ? colors.success + "44"
                          : colors.fake + "44",
                    },
                  ]}
                >
                  <Feather
                    name={selected === currentQuiz.correctIdx ? "check-circle" : "info"}
                    size={r.sp(14)}
                    color={selected === currentQuiz.correctIdx ? colors.success : colors.fake}
                  />
                  <Text style={[styles.explanationText, { color: colors.foreground, fontSize: r.fs(14), lineHeight: r.fs(22) }]}>
                    {currentQuiz.explanation}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {phase === "done" && (
        <View style={[styles.doneSection, { paddingHorizontal: r.hp }]}>
          <View style={{ maxWidth: r.maxW, alignSelf: "center", width: "100%", alignItems: "center", gap: 18 }}>
            <View style={[styles.doneIconBox, { backgroundColor: lesson.color + "18", width: r.sp(100), height: r.sp(100), borderRadius: r.sp(28) }]}>
              <Feather name="award" size={r.sp(48)} color={lesson.color} />
            </View>
            <Text style={[styles.doneTitle, { color: colors.foreground, fontSize: r.fs(24) }]}>
              Ders Tamamlandı!
            </Text>
            <Text style={[styles.doneLessonName, { color: lesson.color, fontSize: r.fs(16) }]}>
              {lesson.title}
            </Text>
            <View style={[styles.doneXPBox, { backgroundColor: colors.warning + "18", borderColor: colors.warning + "44" }]}>
              <Feather name="zap" size={r.sp(22)} color={colors.warning} />
              <View>
                <Text style={[styles.doneXPNum, { color: colors.warning, fontSize: r.fs(22) }]}>+{totalXP} XP</Text>
                {bonusXP > 0 && (
                  <Text style={[styles.doneXPBonus, { color: colors.mutedForeground }]}>
                    Temel: +{lesson.xpReward} · Quiz bonusu: +{bonusXP}
                  </Text>
                )}
              </View>
            </View>
            <View style={[styles.doneAutoNote, { backgroundColor: lesson.color + "18" }]}>
              <Feather name="loader" size={r.sp(14)} color={lesson.color} />
              <Text style={[styles.doneAutoText, { color: lesson.color, fontSize: r.fs(13) }]}>
                Akademiye dönülüyor…
              </Text>
            </View>
          </View>
        </View>
      )}
      </View>

      {(phase === "content" || (phase === "quiz" && showResult)) && (
        <View
          style={[
            styles.continueBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingHorizontal: r.hp,
              paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 16,
            },
          ]}
        >
          <TouchableOpacity
            style={[styles.continueBtn, { backgroundColor: lesson.color, maxWidth: r.maxW, alignSelf: "center", width: "100%" }]}
            onPress={phase === "content" ? handleContentNext : handleQuizNext}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueBtnText, { fontSize: r.fs(15) }]}>
              {phase === "content"
                ? contentIdx < lesson.content.length - 1
                  ? "Devam Et"
                  : "Quiz'e Geç"
                : quizIdx < lesson.quiz.length - 1
                ? "Sonraki Soru"
                : "Sonucu Gör"}
            </Text>
            <Feather name="arrow-right" size={r.sp(18)} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function AcademyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const { lessons } = useContent();
  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const [activeTab, setActiveTab] = useState<"lessons" | "badges">("lessons");
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [xpFloaterVisible, setXpFloaterVisible] = useState(false);
  const [xpFloaterAmount, setXpFloaterAmount] = useState(0);

  const badges = user.getBadges();
  const earnedCount = badges.filter((b) => b.earned).length;

  const handleCompleteLesson = (lessonId: string, xp: number) => {
    user.completeLesson(lessonId);
    user.earnXP(xp);
    setXpFloaterAmount(xp);
    setXpFloaterVisible(true);
    setActiveLesson(null);
  };

  if (activeLesson) {
    const lesson = lessons.find((l) => l.id === activeLesson);
    if (lesson) {
      return (
        <View style={{ flex: 1 }}>
          <LessonPlayer
            lesson={lesson}
            onComplete={(xp) => handleCompleteLesson(lesson.id, xp)}
            onExit={() => setActiveLesson(null)}
          />
          <XPFloater
            visible={xpFloaterVisible}
            amount={xpFloaterAmount}
            onDone={() => setXpFloaterVisible(false)}
          />
        </View>
      );
    }
  }

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingTop: topPadding + 16,
          paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.header}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Akademi</Text>
          <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>
            Oku · Quiz çöz · XP kazan
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(40).springify()}
          style={[styles.infoBanner, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "28" }]}
        >
          <View style={[styles.infoBannerIcon, { backgroundColor: colors.primary + "22" }]}>
            <Feather name="book-open" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.infoBannerTitle, { color: colors.foreground }]}>
              Dedektif Akademisi
            </Text>
            <Text style={[styles.infoBannerText, { color: colors.mutedForeground }]}>
              Dezenformasyonu tanımayı öğren. Dersleri oku, quizleri çöz. Doğru cevap bonus XP, yanlış cevap XP düşürür.
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.tabRow}>
          {(["lessons", "badges"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
            >
              <Feather
                name={tab === "lessons" ? "book-open" : "award"}
                size={14}
                color={activeTab === tab ? "#fff" : colors.mutedForeground}
              />
              <Text style={[styles.tabText, { color: activeTab === tab ? "#fff" : colors.mutedForeground }]}>
                {tab === "lessons"
                  ? `Dersler · ${user.completedLessons.length}/${lessons.length}`
                  : `Rozetler · ${earnedCount}/${badges.length}`}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {activeTab === "lessons" && (
          <View style={styles.lessonsGrid}>
            {lessons.map((lesson, i) => {
              const done = user.completedLessons.includes(lesson.id);
              const locked = i > 0 && !user.completedLessons.includes(lessons[i - 1].id);

              return (
                <Animated.View
                  key={lesson.id}
                  entering={FadeInDown.delay(100 + i * 55).springify()}
                >
                  <TouchableOpacity
                    style={[
                      styles.lessonCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: done
                          ? lesson.color + "44"
                          : locked
                          ? colors.border
                          : colors.border,
                        opacity: locked ? 0.5 : 1,
                      },
                    ]}
                    onPress={() => !locked && setActiveLesson(lesson.id)}
                    activeOpacity={locked ? 1 : 0.78}
                    disabled={locked}
                  >
                    <View
                      style={[
                        styles.lessonIconBox,
                        {
                          backgroundColor: locked
                            ? colors.secondary
                            : done
                            ? lesson.color + "25"
                            : lesson.color + "18",
                        },
                      ]}
                    >
                      <Feather
                        name={locked ? "lock" : done ? "check-circle" : (lesson.icon as any)}
                        size={22}
                        color={locked ? colors.mutedForeground : lesson.color}
                      />
                    </View>
                    <View style={styles.lessonMeta}>
                      <Text style={[styles.lessonTitle, { color: locked ? colors.mutedForeground : colors.foreground }]}>
                        {lesson.title}
                      </Text>
                      <Text style={[styles.lessonSubtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
                        {locked ? "Önceki dersi tamamla" : lesson.subtitle}
                      </Text>
                      {!locked && (
                        <View style={styles.lessonFooter}>
                          <View style={styles.metaRow}>
                            <Feather name="clock" size={10} color={colors.mutedForeground} />
                            <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{lesson.duration}</Text>
                          </View>
                          <View style={styles.metaRow}>
                            <Feather name="zap" size={10} color={colors.warning} />
                            <Text style={[styles.metaText, { color: colors.warning }]}>+{lesson.xpReward}+ XP</Text>
                          </View>
                          <View style={styles.metaRow}>
                            <Feather name="help-circle" size={10} color={colors.primary} />
                            <Text style={[styles.metaText, { color: colors.primary }]}>
                              {lesson.quiz.length} soru
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                    {done ? (
                      <View style={[styles.doneTag, { backgroundColor: lesson.color + "22" }]}>
                        <Feather name="check" size={12} color={lesson.color} />
                        <Text style={[styles.doneTagText, { color: lesson.color }]}>Bitti</Text>
                      </View>
                    ) : locked ? (
                      <Feather name="lock" size={16} color={colors.mutedForeground} />
                    ) : (
                      <Feather name="chevron-right" size={18} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}

        {activeTab === "badges" && (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.badgesSection}>
            <View
              style={[styles.badgeSummary, { backgroundColor: colors.card, borderColor: colors.warning + "44" }]}
            >
              <View style={[styles.badgeSummaryIcon, { backgroundColor: colors.warning + "18" }]}>
                <Feather name="award" size={28} color={colors.warning} />
              </View>
              <View>
                <Text style={[styles.badgeSummaryNum, { color: colors.foreground }]}>
                  {earnedCount}/{badges.length}
                </Text>
                <Text style={[styles.badgeSummaryLabel, { color: colors.mutedForeground }]}>
                  rozet kazanıldı
                </Text>
              </View>
            </View>
            <View style={styles.badgesGrid}>
              {badges.map((badge, i) => (
                <Animated.View
                  key={badge.id}
                  entering={FadeInDown.delay(120 + i * 45).springify()}
                  style={{ width: "47%" }}
                >
                  <BadgeCard badge={badge} />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      <XPFloater
        visible={xpFloaterVisible}
        amount={xpFloaterAmount}
        onDone={() => setXpFloaterVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 12 },
  pageTitle: { fontFamily: "Inter_700Bold", fontSize: 28, marginBottom: 4 },
  pageSub: { fontFamily: "Inter_400Regular", fontSize: 14 },
  infoBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoBannerIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  infoBannerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
  },
  infoBannerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  lessonsGrid: { gap: 10 },
  lessonCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  lessonIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  lessonMeta: { flex: 1, gap: 3 },
  lessonTitle: { fontFamily: "Inter_700Bold", fontSize: 14 },
  lessonSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12 },
  lessonFooter: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 11 },
  doneTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  doneTagText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  badgesSection: { gap: 14 },
  badgeSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  badgeSummaryIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeSummaryNum: { fontFamily: "Inter_700Bold", fontSize: 22 },
  badgeSummaryLabel: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 2 },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  playerContainer: { flex: 1 },
  playerTopBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  playerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  progressTrack: { flex: 1, height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  stepBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  stepBadgeText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  playerContent: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  contentBody: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
    paddingVertical: 24,
  },
  lessonIconBig: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  lessonStepLabel: { fontFamily: "Inter_700Bold", fontSize: 13, textAlign: "center" },
  contentText: {
    fontFamily: "Inter_400Regular",
    fontSize: 17,
    lineHeight: 28,
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  quizHeaderText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  quizQuestion: { fontFamily: "Inter_700Bold", fontSize: 18, lineHeight: 28 },
  quizOptions: { gap: 10 },
  quizOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  optionLetter: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  optionLetterText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  quizOptionText: { fontFamily: "Inter_500Medium", fontSize: 15, flex: 1, lineHeight: 22 },
  explanationBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
  },
  explanationText: { fontFamily: "Inter_400Regular", fontSize: 14, lineHeight: 22, flex: 1 },
  continueBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  continueBtnText: { fontFamily: "Inter_700Bold", fontSize: 15, color: "#fff" },
  doneSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 18,
  },
  doneIconBox: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  doneTitle: { fontFamily: "Inter_700Bold", fontSize: 26, textAlign: "center" },
  doneLessonName: { fontFamily: "Inter_600SemiBold", fontSize: 16, textAlign: "center" },
  doneXPBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  doneXPNum: { fontFamily: "Inter_700Bold", fontSize: 24 },
  doneXPBonus: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  doneAutoNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  doneAutoText: { fontFamily: "Inter_500Medium", fontSize: 13 },
});
