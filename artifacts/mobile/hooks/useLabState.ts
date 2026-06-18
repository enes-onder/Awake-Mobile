/**
 * useLabState — Lab ekranının tüm state ve iş mantığını yönetir.
 *
 * Lab ekranında iki sekme bulunur: "vakalar" ve "simulasyon".
 * Vaka akışı: list → active → result (sonra tekrar active veya list)
 * Simülasyon akışı: list → SimulasyonPlayer → tamamlanma
 *
 * Dışarıya açılan değerler:
 *  - Sekme/state yönetimi, aktif vaka/simülasyon
 *  - Animasyon tetikleyicileri: celebVisible, xpFloaterVisible
 *  - Eylemler: handleStartMission, handleVerdict, handleUseClue, handleSimComplete
 */

import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContent } from "@/context/ContentContext";
import { useUser } from "@/context/UserContext";
import type { Mission } from "@/data/missions";
import type { Simulation } from "@/data/simulations";

/** Lab ekranındaki aktif sekme */
export type LabTab = "vakalar" | "simulasyon";

/** Vaka oynanışının aşaması */
export type LabState = "list" | "active" | "result";

/** useLabState hook'unun tam dönüş tipi */
export interface UseLabStateReturn {
  activeTab: LabTab;
  labState: LabState;
  /** pendingMissions dizisindeki aktif vakanın indeksi */
  currentMissionIdx: number;
  /** Açıklanan ipucu sayısı (0 = hiç ipucu kullanılmadı) */
  clueIndex: number;
  /** Son cevabın doğruluğu — result ekranında gösterilir */
  lastCorrect: boolean;
  /** Son kazanılan/kaybedilen XP miktarı */
  lastXP: number;
  /** XP hesabında uygulanan çarpan (günlük 2x veya normal 1x) */
  lastMultiplier: number;
  /** Oynanmakta olan simülasyonun id'si, yoksa null */
  activeSim: string | null;
  /** Bu oturumda tamamlanan simülasyon id'leri */
  completedSims: string[];
  /** Kutlama overlay'i görünür mü */
  celebVisible: boolean;
  /** Kutlama overlay'i doğru cevap için mi gösteriliyor */
  celebCorrect: boolean;
  /** XP uçan animasyonu görünür mü */
  xpFloaterVisible: boolean;
  /** XP uçan animasyonunun gösterdiği miktar */
  xpFloaterAmount: number;
  /** Web'de min 67px, native'de güvenli alan kadar üst boşluk */
  topPadding: number;
  /** Alt güvenli alan yüksekliği */
  bottomInset: number;
  /** Henüz tamamlanmamış vakalar listesi */
  pendingMissions: Mission[];
  /** Tamamlanmış vakalar listesi */
  completedMissions: Mission[];
  /** Şu anda oynanan vaka, yoksa null */
  activeMission: Mission | null;
  /** Oynanmakta olan simülasyonun tam verisi */
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

  /** Web'de navigasyon çubuğu için minimum 67px üst boşluk */
  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  /** Kullanıcının henüz tamamlamadığı vakalar */
  const pendingMissions = missions.filter(
    (m) => !user.completedMissions.includes(m.id)
  );
  /** Kullanıcının tamamladığı vakalar */
  const completedMissions = missions.filter((m) =>
    user.completedMissions.includes(m.id)
  );
  const activeMission = pendingMissions[currentMissionIdx] ?? null;
  const activeSim_data = simulations.find((s) => s.id === activeSim);

  /** Belirtilen indeksteki vakayı başlatır */
  const handleStartMission = (idx: number) => {
    setCurrentMissionIdx(idx);
    setClueIndex(0);
    setLabState("active");
  };

  /**
   * Kullanıcının "Gerçek" veya "Sahte" kararını işler:
   * 1. Doğruluk kontrolü
   * 2. XP hesaplama (doğruysa reward × multiplier, yanlışsa -%40)
   * 3. UserContext güncelleme
   * 4. Kutlama animasyonunu tetikleme
   * 5. 2.3 saniye sonra result ekranına geçiş
   */
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

    /** Native cihazlarda haptik geri bildirim */
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(
        correct
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error
      );
    }

    /** Kutlama animasyonu bittikten sonra result ekranına geç */
    setTimeout(() => {
      setCelebVisible(false);
      setTimeout(() => setLabState("result"), 380);
    }, 2300);
  };

  /**
   * Bir ipucu açar ve 5 XP düşürür.
   * Tüm ipuçları zaten açıksa hiçbir şey yapmaz.
   */
  const handleUseClue = () => {
    if (!activeMission || clueIndex >= activeMission.clues.length) return;
    setClueIndex((prev) => prev + 1);
    user.earnXP(-5);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  /**
   * Result ekranından "Sonraki Vaka"ya geçer.
   * Bekleyen vaka yoksa liste ekranına döner.
   */
  const handleNextMission = () => {
    if (pendingMissions.length > 0) {
      setCurrentMissionIdx(0);
      setClueIndex(0);
      setLabState("active");
    } else {
      setLabState("list");
    }
  };

  /**
   * Simülasyon tamamlandığında XP kazandırır ve listeye döner.
   * Aynı simülasyon bir oturumda iki kez tamamlanamaz.
   */
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
