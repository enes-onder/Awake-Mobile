/**
 * (tabs)/academy.tsx — Akademi ekranı.
 *
 * İki sekme içerir:
 *  - "lessons" → Ders listesi: okuma metni + quiz
 *  - "badges"  → Rozet koleksiyonu
 *
 * Ders oynatıcısı (LessonPlayer) aktifken tam ekran gösterilir.
 * Dersler sıralıdır; bir sonraki ders önceki tamamlanmadan kilitli kalır.
 *
 * LessonPlayer akışı: content (paragraflar) → quiz (sorular) → done (özet)
 * Quiz: doğru cevap +10 XP bonus, yanlış cevap -10 XP düşürür.
 */

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

// ─── Alt Bileşenler ────────────────────────────────────────────────────────

/**
 * Ders/Quiz ilerleme çubuğu.
 * current/total oranını 400ms animasyonla doldurur.
 */
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

/**
 * Quiz cevap seçeneği.
 * showResult=true olduğunda doğru cevabı yeşil, yanlış seçimi kırmızı gösterir.
 */
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

// ─── Ders Oynatıcısı ───────────────────────────────────────────────────────

/**
 * LessonPlayer — Tek bir dersi baştan sona oynatır.
 *
 * Aşamalar:
 *  1. content: paragrafları tek tek göster
 *  2. quiz: soruları yanıtla (doğru +10 XP bonus, yanlış -10 XP)
 *  3. done: tamamlanma özeti, 2sn sonra otomatik çıkış
 */
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
  /** Quiz doğru cevaplardan biriken bonus XP */
  const [bonusXP, setBonusXP] = useState(0);

  const totalSteps = lesson.content.length + lesson.quiz.length;
  const currentStep = phase === "content"
    ? contentIdx
    : phase === "quiz"
    ? lesson.content.length + quizIdx
    : totalSteps;

  const currentQuiz = lesson.quiz[quizIdx];

  /** Sonraki paragraf veya quiz aşamasına geç */
  const handleContentNext = () => {
    if (contentIdx < lesson.content.length - 1) {
      setContentIdx(c => c + 1);
    } else {
      setPhase("quiz");
    }
  };

  /**
   * Quiz cevabı seçildiğinde:
   * - Doğruysa +10 XP bonus biriktirir
   * - Yanlışsa kullanıcıdan -10 XP düşürür
   * - Haptik geri bildirim verir (native cihazlarda)
   */
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

  /** Sonraki soruya geç veya done aşamasına gir */
  const handleQuizNext = () => {
    if (quizIdx < lesson.quiz.length - 1) {
      setQuizIdx(q => q + 1);
      setSelected(null);
      setShowResult(false);
    } else {
      setPhase("done");
    }
  };

  /** Toplam XP: dersin temel ödülü + quiz bonus XP'si */
  const totalXP = lesson.xpReward + bonusXP;

  /** Done aşamasına girilince 2sn sonra otomatik tamamla */
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
      {/* Üst çubuk: kapat butonu + ilerleme çubuğu + adım sayacı */}
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
            <View style={{ maxWidth: r.maxW, alignSelf: "center", width: "100%", paddingHorizontal: r.hp, paddingTop: 8, justifyContent: "flex-start", gap: 0 }}>
              <View style={[styles.lessonIconBig, { backgroundColor: lesson.color + "18", width: r.sp(72), height: r.sp(72), borderRadius: r.sp(20), marginTop: r.sp(28), marginBottom: r.sp(24) }]}>
                <Feather name={lesson.icon as any} size={r.sp(36)} color={lesson.color} />
              </View>
              <Text style={[styles.lessonStepLabel, { color: lesson.color, fontSize: r.fs(13), marginBottom: r.sp(10) }]}>
                Ders · {contentIdx + 1}/{lesson.content.length}
              </Text>
              <Text style={[styles.contentText, { color: colors.foreground, fontSize: r.fs(16), lineHeight: r.fs(26) }]}>
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

      {/* Devam et / Sonraki soru butonu — content ve quiz cevabından sonra gösterilir */}
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

// ─── Ana Akademi Ekranı ────────────────────────────────────────────────────

export default function AcademyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const { lessons } = useContent();
  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  /** Aktif sekme: dersler veya rozetler */
  const [activeTab, setActiveTab] = useState<"lessons" | "badges">("lessons");
  /** Oynatılmakta olan ders id'si; null ise liste görünümü */
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [xpFloaterVisible, setXpFloaterVisible] = useState(false);
  const [xpFloaterAmount, setXpFloaterAmount] = useState(0);

  const badges = user.getBadges();
  const earnedCount = badges.filter((b) => b.earned).length;

  /** Ders tamamlandığında XP kazandır, listelere geri dön */
  const handleCompleteLesson = (lessonId: string, xp: number) => {
    user.completeLesson(lessonId);
    user.earnXP(xp);
    setXpFloaterAmount(xp);
    setXpFloaterVisible(true);
    setActiveLesson(null);
  };

  /** Aktif ders varsa LessonPlayer'ı tam ekran göster */
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

        {/* Açıklama banner'ı */}
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

        {/* Dersler / Rozetler sekme butonları */}
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
              /** Önceki ders tamamlanmadıysa bu ders kilitli */
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
            {/* Rozet özet kartı */}
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
  pageTitle: { fontFamily: "Inter_700Bold", fontSize: 28, letterSpacing: -0.5 },
  pageSub: { fontFamily: "Inter_400Regular", fontSize: 13, marginTop: 4 },
  infoBanner: { flexDirection: "row", gap: 12, alignItems: "flex-start", padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 16 },
  infoBannerIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  infoBannerTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  infoBannerText: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 18 },
  tabRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5 },
  tabText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  lessonsGrid: { gap: 10 },
  lessonCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1.5 },
  lessonIconBox: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  lessonMeta: { flex: 1, gap: 3 },
  lessonTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  lessonSubtitle: { fontFamily: "Inter_400Regular", fontSize: 12 },
  lessonFooter: { flexDirection: "row", gap: 10, marginTop: 4 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontFamily: "Inter_400Regular", fontSize: 10 },
  doneTag: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  doneTagText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  badgesSection: { gap: 14 },
  badgeSummary: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1.5 },
  badgeSummaryIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  badgeSummaryNum: { fontFamily: "Inter_700Bold", fontSize: 22 },
  badgeSummaryLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  badgesGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between" },
  playerContainer: { flex: 1 },
  playerTopBar: { paddingVertical: 10 },
  playerCloseBtn: { alignItems: "center", justifyContent: "center" },
  progressTrack: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  stepBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  stepBadgeText: { fontFamily: "Inter_600SemiBold" },
  lessonIconBig: { alignItems: "center", justifyContent: "center" },
  lessonStepLabel: { fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  contentText: { fontFamily: "Inter_400Regular" },
  quizHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  quizHeaderText: { fontFamily: "Inter_600SemiBold" },
  quizQuestion: { fontFamily: "Inter_600SemiBold" },
  quizOptions: {},
  quizOption: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  optionLetter: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  optionLetterText: { fontFamily: "Inter_700Bold", fontSize: 13 },
  quizOptionText: { flex: 1, fontFamily: "Inter_500Medium", fontSize: 14, lineHeight: 20 },
  explanationBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderRadius: 12, borderWidth: 1 },
  explanationText: { flex: 1, fontFamily: "Inter_400Regular" },
  doneSection: { flex: 1, alignItems: "center", justifyContent: "center" },
  doneIconBox: { alignItems: "center", justifyContent: "center" },
  doneTitle: { fontFamily: "Inter_700Bold" },
  doneLessonName: { fontFamily: "Inter_600SemiBold" },
  doneXPBox: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderRadius: 16, borderWidth: 1 },
  doneXPNum: { fontFamily: "Inter_700Bold" },
  doneXPBonus: { fontFamily: "Inter_400Regular", fontSize: 12, marginTop: 2 },
  doneAutoNote: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  doneAutoText: { fontFamily: "Inter_500Medium" },
  continueBar: { paddingTop: 12, borderTopWidth: 1 },
  continueBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 16 },
  continueBtnText: { fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.2 },
});
