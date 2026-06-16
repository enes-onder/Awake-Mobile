import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SimulationPlayer } from "@/components/SimulationPlayer";
import { XPFloater } from "@/components/XPFloater";
import { ActiveMissionView } from "@/components/lab/ActiveMissionView";
import { LabTabButton } from "@/components/lab/LabTabButton";
import { MissionResultView } from "@/components/lab/MissionResultView";
import { SimulasyonTab } from "@/components/lab/SimulasyonTab";
import { VakalarTab } from "@/components/lab/VakalarTab";
import { styles } from "@/components/lab/labStyles";
import { useContent } from "@/context/ContentContext";
import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

type LabTab = "vakalar" | "simulasyon";
type LabState = "list" | "active" | "result";

export default function LabScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const user = useUser();
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
      setTimeout(() => setLabState("result"), 380);
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
      <ActiveMissionView
        activeMission={activeMission}
        currentMissionIdx={currentMissionIdx}
        pendingMissionsCount={pendingMissions.length}
        clueIndex={clueIndex}
        celebVisible={celebVisible}
        celebCorrect={celebCorrect}
        xpFloaterVisible={xpFloaterVisible}
        xpFloaterAmount={xpFloaterAmount}
        topPadding={topPadding}
        bottomInset={insets.bottom}
        onBack={() => setLabState("list")}
        onVerdictSelected={handleVerdict}
        onUseClue={handleUseClue}
        onXPFloaterDone={() => setXpFloaterVisible(false)}
      />
    );
  }

  if (labState === "result" && activeMission) {
    return (
      <MissionResultView
        activeMission={activeMission}
        lastCorrect={lastCorrect}
        lastXP={lastXP}
        lastMultiplier={lastMultiplier}
        pendingMissionsCount={pendingMissions.length}
        topPadding={topPadding}
        bottomInset={insets.bottom}
        onNextMission={handleNextMission}
        onBackToList={() => setLabState("list")}
      />
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
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={styles.listHeader}
        >
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            Haber Lab.
          </Text>
          <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>
            Analiz et · Simüle et · Karar ver
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={styles.tabsRow}
        >
          <LabTabButton
            label="Vaka Analizi"
            icon="activity"
            active={activeTab === "vakalar"}
            onPress={() => setActiveTab("vakalar")}
          />
          <LabTabButton
            label="Simülasyon"
            icon="layers"
            active={activeTab === "simulasyon"}
            onPress={() => setActiveTab("simulasyon")}
          />
        </Animated.View>

        {activeTab === "vakalar" && (
          <VakalarTab
            pendingMissions={pendingMissions}
            completedMissions={completedMissions}
            onStartMission={handleStartMission}
          />
        )}

        {activeTab === "simulasyon" && (
          <SimulasyonTab
            simulations={simulations}
            completedSims={completedSims}
            onStartSim={setActiveSim}
          />
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
