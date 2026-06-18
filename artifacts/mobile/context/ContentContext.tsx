/**
 * ContentContext — Vakalar, dersler ve simülasyonları API'den yükler.
 *
 * userXP prop'u değiştiğinde içerik yeniden çekilir ve kilitleme
 * mantığı (requiredXp kontrolü) tekrar hesaplanır.
 *
 * Yükleme başarısız olursa yerel statik veri (data/ klasörü) yedek olarak kullanılır.
 */

import React, { createContext, useContext, useEffect, useState } from "react";

import { LESSONS, type Lesson } from "@/data/lessons";
import { MISSIONS, type Mission } from "@/data/missions";
import { SIMULATIONS, type Simulation } from "@/data/simulations";
import { api } from "@/lib/api";

/** Context'in tuttuğu ve dışarıya açtığı tüm değerler */
interface ContentState {
  missions: Mission[];
  lessons: Lesson[];
  simulations: Simulation[];
  /** API isteği devam ediyorken true */
  isLoading: boolean;
  /** API hatası varsa hata mesajı, yoksa null */
  error: string | null;
  /** Kullanıcının XP'si yetersiz olan vaka id'leri */
  lockedMissionIds: string[];
  /** Kullanıcının XP'si yetersiz olan ders id'leri */
  lockedLessonIds: string[];
  /** Kullanıcının XP'si yetersiz olan simülasyon id'leri */
  lockedSimulationIds: string[];
}

/** API yanıtı yüklenemezse statik verilerle dolu varsayılan context değeri */
const ContentContext = createContext<ContentState>({
  missions: MISSIONS,
  lessons: LESSONS,
  simulations: SIMULATIONS,
  isLoading: false,
  error: null,
  lockedMissionIds: [],
  lockedLessonIds: [],
  lockedSimulationIds: [],
});

// ─── API → Tip Dönüştürücüler ──────────────────────────────────────────────
// API yanıtı snake_case (xp_reward) veya camelCase (xpReward) döndürebilir;
// ?? operatörü her ikisini de destekler.

/** Ham API satırını Mission tipine dönüştürür */
function mapMission(row: Record<string, unknown>): Mission {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    difficulty: row.difficulty as 1 | 2 | 3,
    type: row.type as Mission["type"],
    xpReward: (row.xp_reward ?? row.xpReward) as number,
    category: row.category as string,
    verdict: row.verdict as "real" | "fake",
    content: row.content as Mission["content"],
    clues: row.clues as string[],
    explanation: row.explanation as string,
  };
}

/** Ham API satırını Lesson tipine dönüştürür */
function mapLesson(row: Record<string, unknown>): Lesson {
  return {
    id: row.id as string,
    title: row.title as string,
    subtitle: row.subtitle as string,
    duration: row.duration as string,
    icon: row.icon as string,
    color: row.color as string,
    xpReward: (row.xp_reward ?? row.xpReward) as number,
    content: row.content as string[],
    quiz: row.quiz as Lesson["quiz"],
  };
}

/** Ham API satırını Simulation tipine dönüştürür */
function mapSimulation(row: Record<string, unknown>): Simulation {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    difficulty: row.difficulty as 1 | 2 | 3,
    xpReward: (row.xp_reward ?? row.xpReward) as number,
    category: row.category as string,
    steps: row.steps as Simulation["steps"],
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────

/**
 * İçerik sağlayıcı bileşeni.
 * @param userXP — Kullanıcının güncel XP değeri; içerik kilitleme hesabı için kullanılır.
 */
export function ContentProvider({
  userXP,
  children,
}: {
  userXP: number;
  children: React.ReactNode;
}) {
  const [missions, setMissions] = useState<Mission[]>(MISSIONS);
  const [lessons, setLessons] = useState<Lesson[]>(LESSONS);
  const [simulations, setSimulations] = useState<Simulation[]>(SIMULATIONS);
  const [lockedMissionIds, setLockedMissionIds] = useState<string[]>([]);
  const [lockedLessonIds, setLockedLessonIds] = useState<string[]>([]);
  const [lockedSimulationIds, setLockedSimulationIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * userXP değiştiğinde API'den tüm içerikleri paralel olarak çeker.
   * Bileşen unmount olursa `cancelled` flag'i ile stale state güncellemesi önlenir.
   */
  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      setIsLoading(true);
      setError(null);

      try {
        /** Üç endpoint paralel çekilir */
        const [missionsData, lessonsData, simsData] = await Promise.all([
          api.getMissions(),
          api.getLessons(),
          api.getSimulations(),
        ]);

        if (cancelled) return;

        const fetchedMissions = missionsData.map((r) => mapMission(r as Record<string, unknown>));
        const fetchedLessons = lessonsData.map((r) => mapLesson(r as Record<string, unknown>));
        const fetchedSims = simsData.map((r) => mapSimulation(r as Record<string, unknown>));

        /** Kullanıcının XP'si yetersiz olan içerikleri kilitli olarak işaretle */
        const lockedM = (missionsData as Record<string, unknown>[])
          .filter((r) => ((r.required_xp ?? r.requiredXp) as number) > userXP)
          .map((r) => r.id as string);
        const lockedL = (lessonsData as Record<string, unknown>[])
          .filter((r) => ((r.required_xp ?? r.requiredXp) as number) > userXP)
          .map((r) => r.id as string);
        const lockedS = (simsData as Record<string, unknown>[])
          .filter((r) => ((r.required_xp ?? r.requiredXp) as number) > userXP)
          .map((r) => r.id as string);

        /** Boş API yanıtında statik veriye düş */
        setMissions(fetchedMissions.length > 0 ? fetchedMissions : MISSIONS);
        setLessons(fetchedLessons.length > 0 ? fetchedLessons : LESSONS);
        setSimulations(fetchedSims.length > 0 ? fetchedSims : SIMULATIONS);
        setLockedMissionIds(lockedM);
        setLockedLessonIds(lockedL);
        setLockedSimulationIds(lockedS);
      } catch (err) {
        /** API erişilemezse statik veriye geri dön */
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "İçerik yüklenemedi");
          setMissions(MISSIONS);
          setLessons(LESSONS);
          setSimulations(SIMULATIONS);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchContent();
    return () => {
      cancelled = true;
    };
  }, [userXP]);

  return (
    <ContentContext.Provider
      value={{
        missions,
        lessons,
        simulations,
        isLoading,
        error,
        lockedMissionIds,
        lockedLessonIds,
        lockedSimulationIds,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

/** ContentContext'e erişim hook'u */
export function useContent() {
  return useContext(ContentContext);
}
