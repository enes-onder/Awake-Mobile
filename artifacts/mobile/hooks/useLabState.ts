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
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useContent } from "@/context/ContentContext";
import { useUser } from "@/context/UserContext";
import type { Mission } from "@/data/missions";
import type { Simulation } from "@/data/simulations";

/** Karar sonrası result ekranına geçiş gecikmesi (ms) — kısa tut, boş active ekranı önle */
const RESULT_TRANSITION_MS = 120;

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
  /** Simülasyon yarıda bırakılınca — completedSims'e ekler (tekrar oynamayı önler), XP kazandırmaz */
  handleSimExit: () => void;
}

export function useLabState(): UseLabStateReturn {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const { missions, simulations } = useContent();

  /** Aktif timer referansları — cleanup ve erken çıkış için tutulur */
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  /** Tüm bekleyen timer'ları iptal eder ve listeyi temizler */
  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  /**
   * Zamanlayıcı kurar, referansı timersRef'e ekler.
   * Timer çalıştığında kendini listeden çıkarır.
   */
  const scheduleTimer = useCallback((callback: () => void, delay: number) => {
    const timer = setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== timer);
      callback();
    }, delay);
    timersRef.current.push(timer);
    return timer;
  }, []);

  /** Hook unmount olduğunda tüm bekleyen timer'ları temizle */
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  const [activeTab, setActiveTab] = useState<LabTab>("vakalar");
  /** İç state setter — doğrudan kullanılmaz; setLabState wrapper üzerinden erişilir */
  const [labState, _setLabState] = useState<LabState>("list");

  /**
   * Lab state'ini günceller.
   * Geçiş öncesinde bekleyen timer'ları temizler — erken çıkışta
   * animasyon timerlarının state'i ezlemesini önler.
   */
  const setLabState = useCallback((nextState: LabState) => {
    clearTimers();
    _setLabState(nextState);
  }, [clearTimers]);
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
   * 2. XP hesaplama (doğruysa reward × multiplier − ipucu cezaları, yanlışsa -%40)
   * 3. UserContext güncelleme — tek atomik completeMission çağrısı
   * 4. XP floater'ı tetikleme
   * 5. RESULT_TRANSITION_MS sonrası result ekranına geçiş (boş active ekran yok)
   */
  const handleVerdict = (verdict: "real" | "fake") => {
    if (!activeMission) return;
    const correct = verdict === activeMission.verdict;
    const multiplier = user.dailyXPMultiplier;
    const baseXP = correct
      ? activeMission.xpReward
      : -Math.floor(activeMission.xpReward * 0.4);
    // İpucu cezası (clueIndex × 5) doğru cevap ödülünden düşülür; yanlış cevapta ek ceza yok
    const xpEarned = correct
      ? Math.max(0, baseXP * multiplier - clueIndex * 5)
      : baseXP;

    /** Sahte tespit: kullanıcı verdict==="fake" olan vakayı doğru tespit etti */
    const wasFakeDetected = correct && activeMission.verdict === "fake";
    /** XP ve tamamlanma tek atomik çağrıda — earnXP ayrıca çağrılmaz */
    user.completeMission(activeMission.id, correct, xpEarned, wasFakeDetected);
    setLastCorrect(correct);
    setLastXP(xpEarned);
    setLastMultiplier(multiplier);
    setCelebCorrect(correct);
    // Banner active ekranda gösterilmiyor — result ekranı zaten "Doğru/Yanlış" gösteriyor.
    // Boş kart alanı + banner combinasyonunu önlemek için celebVisible false kalır.
    setCelebVisible(false);
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

    /** Kısa gecikme sonrası result ekranına geç — boş active ekranını önler. */
    scheduleTimer(() => {
      setLabState("result");
    }, RESULT_TRANSITION_MS);
  };

  /**
   * Bir ipucu açar. Ceza genel XP'den anında DÜŞÜRÜLMEz —
   * handleVerdict içinde xpEarned hesaplanırken doğru cevap ödülünden düşülür.
   * Tüm ipuçları zaten açıksa hiçbir şey yapmaz.
   */
  const handleUseClue = () => {
    if (!activeMission || clueIndex >= activeMission.clues.length) return;
    setClueIndex((prev) => prev + 1);
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
   * Simülasyon yarıda çıkılınca completedSims'e ekler (XP kazandırmaz).
   * Böylece aynı simülasyon tekrar tekrar girilerek XP farmlanamazˌ
   */
  const handleSimExit = () => {
    const simId = activeSim;
    if (simId && !completedSims.includes(simId)) {
      setCompletedSims((prev) => [...prev, simId]);
    }
    setActiveSim(null);
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
    handleSimExit,
  };
}
