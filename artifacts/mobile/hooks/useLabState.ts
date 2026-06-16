import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContent } from "@/context/ContentContext";
import { useUser } from "@/context/UserContext";
import type { Mission } from "@/data/missions";
import type { Simulation } from "@/data/simulations";

export type LabTab = "vakalar" | "simulasyon";
export type LabState = "list" | "active" | "result";

export interface UseLabStateReturn {
  activeTab: LabTab;
  labState: LabState;
  currentMissionIdx: number;
  clueIndex: number;
  lastCorrect: boolean;
  lastXP: number;
  lastMultiplier: number;
  activeSim: string | null;
  completedSims: string[];
  celebVisible: boolean;
  celebCorrect: boolean;
  xpFloaterVisible: boolean;
  xpFloaterAmount: number;
  topPadding: number;
  bottomInset: number;
  pendingMissions: Mission[];
  completedMissions: Mission[];
  activeMission: Mission | null;
  activeSim_data: Simulation | undefined;
  simulations: Simulation[];
  setActiveTab: (tab: LabTab) => void;
  setLabState: (state: LabState) => void;
  setActiveSim: (id: string | null) => void;
  setXpFloaterVisible: (v: boolean) => void;
  handleStartMission: (idx: number) => void;
  handleVerdict: (verdict: "real" | "fake") => void;
  handleUseClue: () => void;
  handleNextMission: () => void;
  handleSimComplete: (simId: string, xpEarned: number) => void;
}

export function useLabState(): UseLabStateReturn {
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
  const activeSim_data = simulations.find((s) => s.id === activeSim);

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
      Haptics.notificationAsync(
        correct
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
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

  return {
    activeTab,
    labState,
    currentMissionIdx,
    clueIndex,
    lastCorrect,
    lastXP,
    lastMultiplier,
    activeSim,
    completedSims,
    celebVisible,
    celebCorrect,
    xpFloaterVisible,
    xpFloaterAmount,
    topPadding,
    bottomInset: insets.bottom,
    pendingMissions,
    completedMissions,
    activeMission,
    activeSim_data,
    simulations,
    setActiveTab,
    setLabState,
    setActiveSim,
    setXpFloaterVisible,
    handleStartMission,
    handleVerdict,
    handleUseClue,
    handleNextMission,
    handleSimComplete,
  };
}
