import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
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
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { SimulationPlayer } from "@/components/SimulationPlayer";
import { SwipeCard } from "@/components/SwipeCard";
import { XPFloater } from "@/components/XPFloater";
import { useUser } from "@/context/UserContext";
import { useContent } from "@/context/ContentContext";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

type LabTab = "vakalar" | "simulasyon";
type LabState = "list" | "active" | "result";

function AnimatedTabBtn({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 8 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 8 });
  };
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { flex: 1 }]}>
      <TouchableOpacity
        style={[
          styles.tabBtn,
          active
            ? { backgroundColor: colors.primary, borderColor: colors.primary }
            : { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.85}
      >
        <Feather
          name={icon as any}
          size={14}
          color={active ? "#fff" : colors.mutedForeground}
        />
        <Text
          style={[
            styles.tabBtnText,
            { color: active ? "#fff" : colors.mutedForeground },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}


export default function LabScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const r = useResponsive();
  const { missions, simulations } = useContent();

  const [activeTab, setActiveTab] = useState<LabTab>("vakalar");
  const [labState, setLabState] = useState<LabState>("list");
  const [currentMissionIdx, setCurrentMissionIdx] = useState(0);
  const [clueIndex, setClueIndex] = useState(0);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastXP, setLastXP] = useState(0);
  const [lastMultiplier, setLastMultiplier] = useState(1);
  const [activeSim, setActiveSim] = useState<string | null>(null);
  const [completedSims, setCompletedSims] = useState<string[]>([]);

  const [celebVisible, setCelebVisible] = useState(false);
  const [celebCorrect, setCelebCorrect] = useState(false);
  const [xpFloaterVisible, setXpFloaterVisible] = useState(false);
  const [xpFloaterAmount, setXpFloaterAmount] = useState(0);

  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const pendingMissions = missions.filter(
    (m) => !user.completedMissions.includes(m.id)
  );
  const completedMissions = missions.filter((m) =>
    user.completedMissions.includes(m.id)
  );
  const activeMission = pendingMissions[currentMissionIdx] ?? null;

  const handleStartMission = (idx: number) => {
    setCurrentMissionIdx(idx);
    setClueIndex(0);
    setLabState("active");
  };

  const handleVerdict = (verdict: "real" | "fake") => {
    if (!activeMission) return;
    const correct = verdict === activeMission.verdict;
    const multiplier = user.dailyXPMultiplier;
    const baseXP = correct
      ? activeMission.xpReward
      : -Math.floor(activeMission.xpReward * 0.4);
    const xpEarned = correct ? baseXP * multiplier : baseXP;

    user.earnXP(xpEarned);
    user.completeMission(activeMission.id, correct);
    setLastCorrect(correct);
    setLastXP(xpEarned);
    setLastMultiplier(multiplier);

    setCelebCorrect(correct);
    setCelebVisible(true);
    setXpFloaterAmount(xpEarned);
    setXpFloaterVisible(true);

    if (Platform.OS !== "web") {
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    }

    setTimeout(() => {
      setCelebVisible(false);
      setTimeout(() => {
        setLabState("result");
      }, 380);
    }, 2300);
  };

  const handleUseClue = () => {
    if (!activeMission || clueIndex >= activeMission.clues.length) return;
    setClueIndex((prev) => prev + 1);
    user.earnXP(-5);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleNextMission = () => {
    if (pendingMissions.length > 0) {
      setCurrentMissionIdx(0);
      setClueIndex(0);
      setLabState("active");
    } else {
      setLabState("list");
    }
  };

  const handleSimComplete = (simId: string, xpEarned: number) => {
    user.earnXP(xpEarned);
    if (!completedSims.includes(simId)) {
      setCompletedSims((prev) => [...prev, simId]);
    }
    setXpFloaterAmount(xpEarned);
    setXpFloaterVisible(true);
    setActiveSim(null);
  };

  if (activeSim) {
    const sim = simulations.find((s) => s.id === activeSim);
    if (sim) {
      return (
        <View style={{ flex: 1 }}>
          <SimulationPlayer
            simulation={sim}
            onComplete={(xp) => handleSimComplete(activeSim, xp)}
            onExit={() => setActiveSim(null)}
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

  if (labState === "active" && activeMission) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Fixed header — no scroll */}
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
              onPress={() => setLabState("list")}
              style={[styles.backBtn, { backgroundColor: colors.secondary }]}
            >
              <Feather name="arrow-left" size={18} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.activeHeaderMeta}>
              <Text style={[styles.activeTitle, { color: colors.foreground }]} numberOfLines={1}>
                {activeMission.title}
              </Text>
              <Text style={[styles.activeSub, { color: colors.mutedForeground }]}>
                {currentMissionIdx + 1}/{pendingMissions.length} · Vaka Analizi
              </Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(60).springify()}
            style={[styles.instructionBox, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>
              Kaydır:{" "}
              <Text style={{ color: colors.success, fontFamily: "Inter_700Bold" }}>Sağ = Doğru</Text>
              {"  "}
              <Text style={{ color: colors.fake, fontFamily: "Inter_700Bold" }}>Sol = Yanlış</Text>
            </Text>
          </Animated.View>
        </View>

        {/* SwipeCard fills remaining space, vertically centered */}
        <View
          style={{
            flex: 1,
            paddingHorizontal: r.hp,
            justifyContent: "center",
            paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 16,
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
              onVerdictSelected={handleVerdict}
              onUseClue={handleUseClue}
            />
          </Animated.View>
        </View>

        <CelebrationOverlay
          visible={celebVisible}
          isCorrect={celebCorrect}
          message={celebCorrect ? "Doğru Tespit!" : "Yanış Tahmin"}
          subMessage={celebCorrect ? "Harika iş, ajan!" : "Dezenformasyon bu sefer kazandı"}
        />
        <XPFloater
          visible={xpFloaterVisible}
          amount={xpFloaterAmount}
          onDone={() => setXpFloaterVisible(false)}
        />
      </View>
    );
  }

  if (labState === "result" && activeMission) {
    return (
      <View style={[styles.resultPage, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: topPadding + 16,
            paddingBottom: 24,
            paddingHorizontal: r.hp,
            maxWidth: r.maxW,
            alignSelf: "center",
            width: "100%",
          }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            entering={FadeInDown.delay(60).duration(380).springify()}
            style={[
              styles.resultCard,
              {
                backgroundColor: colors.card,
                borderColor: lastCorrect ? colors.success + "66" : colors.fake + "66",
              },
            ]}
          >
            <View
              style={[
                styles.resultIconCircle,
                { backgroundColor: lastCorrect ? colors.success + "22" : colors.fake + "22" },
              ]}
            >
              <Feather
                name={lastCorrect ? "check-circle" : "x-circle"}
                size={40}
                color={lastCorrect ? colors.success : colors.fake}
              />
            </View>
            <Text style={[styles.resultHeadline, { color: lastCorrect ? colors.success : colors.fake }]}>
              {lastCorrect ? "Doğru Tespit!" : "Yanlış Tahmin"}
            </Text>
            <Text style={[styles.resultMission, { color: colors.foreground }]}>
              {activeMission.title}
            </Text>
            <View
              style={[
                styles.xpEarnedBox,
                {
                  backgroundColor: (lastXP >= 0 ? colors.warning : colors.fake) + "18",
                  borderColor: (lastXP >= 0 ? colors.warning : colors.fake) + "44",
                },
              ]}
            >
              <Feather name="zap" size={18} color={lastXP >= 0 ? colors.warning : colors.fake} />
              <View>
                <Text style={[styles.xpEarnedText, { color: lastXP >= 0 ? colors.warning : colors.fake }]}>
                  {lastXP >= 0 ? `+${lastXP} XP kazandın` : `${lastXP} XP kaybettin`}
                </Text>
                {lastXP >= 0 && lastMultiplier > 1 && (
                  <Text style={{ color: colors.warning, fontFamily: "Inter_400Regular", fontSize: 11, opacity: 0.8 }}>
                    Günlük 2× bonus dahil!
                  </Text>
                )}
              </View>
            </View>
            <View style={[styles.verdictBox, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.verdictLabel, { color: colors.mutedForeground }]}>Gerçek durum:</Text>
              <View
                style={[
                  styles.verdictTag,
                  {
                    backgroundColor:
                      activeMission.verdict === "real" ? colors.success + "22" : colors.fake + "22",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.verdictTagText,
                    { color: activeMission.verdict === "real" ? colors.success : colors.fake },
                  ]}
                >
                  {activeMission.verdict === "real" ? "DOĞRU HABER" : "YANLIŞ HABER"}
                </Text>
              </View>
            </View>
            <Text style={[styles.explanationText, { color: colors.mutedForeground }]}>
              {activeMission.explanation}
            </Text>
          </Animated.View>
        </ScrollView>

        {/* Buttons anchored to bottom */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(320).springify()}
          style={[
            styles.resultActionBar,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.border,
              paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 16,
              paddingHorizontal: r.hp,
            },
          ]}
        >
          <View style={{ maxWidth: r.maxW, alignSelf: "center", width: "100%", gap: 10 }}>
            {pendingMissions.length > 1 && (
              <TouchableOpacity
                style={[styles.nextBtn, { backgroundColor: colors.primary }]}
                onPress={handleNextMission}
                activeOpacity={0.8}
              >
                <Text style={[styles.nextBtnText, { color: "#fff" }]}>Sonraki Vaka</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.listBtn, { borderColor: colors.border }]}
              onPress={() => setLabState("list")}
              activeOpacity={0.7}
            >
              <Text style={[styles.listBtnText, { color: colors.foreground }]}>
                Vaka Listesine Dön
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPadding + 16,
          paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 90,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(0).springify()} style={styles.listHeader}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Haber Lab.</Text>
          <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>
            Analiz et · Simüle et · Karar ver
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.tabsRow}>
          <AnimatedTabBtn
            label="Vaka Analizi"
            icon="activity"
            active={activeTab === "vakalar"}
            onPress={() => setActiveTab("vakalar")}
          />
          <AnimatedTabBtn
            label="Simülasyon"
            icon="layers"
            active={activeTab === "simulasyon"}
            onPress={() => setActiveTab("simulasyon")}
          />
        </Animated.View>

        {activeTab === "vakalar" && (
          <>
            <Animated.View
              entering={FadeInDown.delay(120).springify()}
              style={[styles.infoBanner, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "28" }]}
            >
              <View style={[styles.infoBannerIcon, { backgroundColor: colors.primary + "22" }]}>
                <Feather name="search" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.infoBannerTitle, { color: colors.foreground }]}>
                  Araştırma Laboratuvarı
                </Text>
                <Text style={[styles.infoBannerText, { color: colors.mutedForeground }]}>
                  Paylaşımları incele, doğru mu yanlış mı karar ver. Doğru cevap XP kazandırır, yanlış cevap XP düşürür.
                </Text>
              </View>
            </Animated.View>
            <View style={styles.quickStats}>
              <View
                style={[styles.quickStat, { backgroundColor: colors.primary + "14", borderColor: colors.primary + "33" }]}
              >
                <Feather name="clock" size={13} color={colors.primary} />
                <Text style={[styles.quickStatText, { color: colors.primary }]}>
                  Bekleyen · {pendingMissions.length}
                </Text>
              </View>
              <View
                style={[styles.quickStat, { backgroundColor: colors.success + "14", borderColor: colors.success + "33" }]}
              >
                <Feather name="check-circle" size={13} color={colors.success} />
                <Text style={[styles.quickStatText, { color: colors.success }]}>
                  Tamamlanan · {completedMissions.length}
                </Text>
              </View>
            </View>

            {pendingMissions.length > 0 && (
              <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.missionSection}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Aktif Vakalar</Text>
                {pendingMissions.map((mission, idx) => {
                  const diffColor = (["", "#00C851", "#FF9500", "#FF3B30"][mission.difficulty] as string);
                  const typeIcons: Record<string, string> = {
                    photo: "image", headline: "type", quote: "message-square",
                    stats: "bar-chart-2", video: "video",
                  };
                  return (
                    <Animated.View
                      key={mission.id}
                      entering={FadeInDown.delay(160 + idx * 50).springify()}
                    >
                      <TouchableOpacity
                        style={[
                          styles.missionItem,
                          { backgroundColor: colors.card, borderColor: colors.border },
                        ]}
                        onPress={() => handleStartMission(idx)}
                        activeOpacity={0.78}
                      >
                        <View style={[styles.missionIcon, { backgroundColor: colors.secondary }]}>
                          <Feather name={typeIcons[mission.type] as any} size={18} color={colors.primary} />
                        </View>
                        <View style={styles.missionMeta}>
                          <Text style={[styles.missionTitle, { color: colors.foreground }]} numberOfLines={1}>
                            {mission.title}
                          </Text>
                          <Text style={[styles.missionCategory, { color: colors.mutedForeground }]}>
                            {mission.category}
                          </Text>
                        </View>
                        <View style={styles.missionRight}>
                          <Text style={[styles.diffText, { color: diffColor }]}>
                            {(["", "Kolay", "Orta", "Zor"] as string[])[mission.difficulty]}
                          </Text>
                          <View style={styles.xpRow}>
                            <Feather name="zap" size={11} color={colors.warning} />
                            <Text style={[styles.xpText, { color: colors.warning }]}>
                              +{mission.xpReward}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </Animated.View>
            )}

            {completedMissions.length > 0 && (
              <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.missionSection}>
                <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                  Tamamlananlar ({completedMissions.length})
                </Text>
                {completedMissions.map((mission, idx) => (
                  <View
                    key={mission.id}
                    style={[
                      styles.missionItem,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.success + "33",
                        opacity: 0.6,
                      },
                    ]}
                  >
                    <View style={[styles.missionIcon, { backgroundColor: colors.success + "18" }]}>
                      <Feather name="check-circle" size={18} color={colors.success} />
                    </View>
                    <View style={styles.missionMeta}>
                      <Text style={[styles.missionTitle, { color: colors.foreground }]} numberOfLines={1}>
                        {mission.title}
                      </Text>
                      <Text style={[styles.missionCategory, { color: colors.mutedForeground }]}>
                        {mission.category}
                      </Text>
                    </View>
                    <Feather name="check" size={16} color={colors.success} />
                  </View>
                ))}
              </Animated.View>
            )}

            {pendingMissions.length === 0 && (
              <Animated.View
                entering={FadeInDown.delay(140).springify()}
                style={[styles.allDoneBox, { backgroundColor: colors.success + "10", borderColor: colors.success + "33" }]}
              >
                <Feather name="award" size={44} color={colors.success} />
                <Text style={[styles.allDoneTitle, { color: colors.foreground }]}>
                  Tüm vakalar tamamlandı!
                </Text>
                <Text style={[styles.allDoneSub, { color: colors.mutedForeground }]}>
                  Harika iş, ajan. Yeni vakalar yakında geliyor.
                </Text>
              </Animated.View>
            )}
          </>
        )}

        {activeTab === "simulasyon" && (
          <View style={styles.simSection}>
            <Animated.View
              entering={FadeInDown.delay(120).springify()}
              style={[styles.infoBanner, { backgroundColor: colors.warning + "14", borderColor: colors.warning + "28" }]}
            >
              <View style={[styles.infoBannerIcon, { backgroundColor: colors.warning + "22" }]}>
                <Feather name="play-circle" size={18} color={colors.warning} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.infoBannerTitle, { color: colors.foreground }]}>
                  Senaryo Simülasyonları
                </Text>
                <Text style={[styles.infoBannerText, { color: colors.mutedForeground }]}>
                  Gerçek hayat senaryolarını adım adım yaşa. Doğru kararlar ver, yıldız ve XP kazan.
                </Text>
              </View>
            </Animated.View>
            {simulations.map((sim, i) => {
              const done = completedSims.includes(sim.id);
              const diffColor = (["", "#00C851", "#FF9500", "#FF3B30"][sim.difficulty] as string);
              return (
                <Animated.View
                  key={sim.id}
                  entering={FadeInDown.delay(100 + i * 60).springify()}
                >
                  <TouchableOpacity
                    style={[
                      styles.simCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: done ? colors.success + "44" : colors.border,
                      },
                    ]}
                    onPress={() => setActiveSim(sim.id)}
                    activeOpacity={0.78}
                  >
                    <View style={styles.simCardTop}>
                      <View
                        style={[
                          styles.simIconBox,
                          { backgroundColor: done ? colors.success + "18" : colors.primary + "18" },
                        ]}
                      >
                        <Feather
                          name={done ? "check-circle" : "play-circle"}
                          size={26}
                          color={done ? colors.success : colors.primary}
                        />
                      </View>
                      <View style={styles.simMeta}>
                        <Text style={[styles.simTitle, { color: colors.foreground }]}>
                          {sim.title}
                        </Text>
                        <Text
                          style={[styles.simDesc, { color: colors.mutedForeground }]}
                          numberOfLines={2}
                        >
                          {sim.description}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.simCardFooter}>
                      <View
                        style={[styles.catTag, { backgroundColor: colors.secondary }]}
                      >
                        <Text style={[styles.catTagText, { color: colors.mutedForeground }]}>
                          {sim.category}
                        </Text>
                      </View>
                      <Text style={[styles.simDiff, { color: diffColor }]}>
                        {(["", "Kolay", "Orta", "Zor"] as string[])[sim.difficulty]}
                      </Text>
                      <View style={styles.xpRow}>
                        <Feather name="zap" size={11} color={colors.warning} />
                        <Text style={[styles.simXP, { color: colors.warning }]}>
                          +{sim.xpReward} XP
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <XPFloater
        visible={xpFloaterVisible}
        amount={xpFloaterAmount}
        onDone={() => setXpFloaterVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listHeader: { marginBottom: 20 },
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
  tabsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  tabBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  quickStats: { flexDirection: "row", gap: 10, marginBottom: 20 },
  quickStat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  quickStatText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  missionSection: { gap: 10, marginBottom: 20 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 15, marginBottom: 4 },
  missionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  missionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  missionMeta: { flex: 1, gap: 3 },
  missionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14 },
  missionCategory: { fontFamily: "Inter_400Regular", fontSize: 12 },
  missionRight: { alignItems: "flex-end", gap: 4 },
  diffText: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  xpText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  allDoneBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 12,
    marginTop: 10,
  },
  allDoneTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    textAlign: "center",
  },
  allDoneSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  simSection: { gap: 14 },
  simInfoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
  },
  simInfoText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 20,
    flex: 1,
  },
  simCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  simCardTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  simIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  simMeta: { flex: 1, gap: 4 },
  simTitle: { fontFamily: "Inter_700Bold", fontSize: 15 },
  simDesc: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  simCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  catTag: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  catTagText: { fontFamily: "Inter_500Medium", fontSize: 11 },
  simDiff: { fontFamily: "Inter_600SemiBold", fontSize: 11 },
  simXP: { fontFamily: "Inter_700Bold", fontSize: 12 },
  activeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeHeaderMeta: { flex: 1 },
  activeTitle: { fontFamily: "Inter_700Bold", fontSize: 18 },
  activeSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14,
  },
  instructionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    flex: 1,
  },
  resultPage: {
    flex: 1,
  },
  resultCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 18,
    alignItems: "center",
    gap: 10,
  },
  resultIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  resultHeadline: { fontFamily: "Inter_700Bold", fontSize: 20 },
  resultMission: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    textAlign: "center",
  },
  xpEarnedBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  xpEarnedText: { fontFamily: "Inter_700Bold", fontSize: 16 },
  verdictBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    width: "100%",
  },
  verdictLabel: { fontFamily: "Inter_400Regular", fontSize: 13 },
  verdictTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verdictTagText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  explanationText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  resultActions: { gap: 10, marginTop: 4 },
  resultActionBar: {
    paddingTop: 12,
    borderTopWidth: 1,
  },
  nextBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 16,
  },
  nextBtnText: { fontFamily: "Inter_700Bold", fontSize: 16 },
  listBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  listBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15 },
});
