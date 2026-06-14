import React, { createContext, useContext, useEffect, useState } from "react";

import { LESSONS, type Lesson } from "@/data/lessons";
import { MISSIONS, type Mission } from "@/data/missions";
import { SIMULATIONS, type Simulation } from "@/data/simulations";
import { supabase } from "@/lib/supabase";

interface ContentState {
  missions: Mission[];
  lessons: Lesson[];
  simulations: Simulation[];
  isLoading: boolean;
  error: string | null;
  lockedMissionIds: string[];
  lockedLessonIds: string[];
  lockedSimulationIds: string[];
}

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

function mapMission(row: Record<string, unknown>): Mission {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    difficulty: row.difficulty as 1 | 2 | 3,
    type: row.type as Mission["type"],
    xpReward: row.xp_reward as number,
    category: row.category as string,
    verdict: row.verdict as "real" | "fake",
    content: row.content as Mission["content"],
    clues: row.clues as string[],
    explanation: row.explanation as string,
  };
}

function mapLesson(row: Record<string, unknown>): Lesson {
  return {
    id: row.id as string,
    title: row.title as string,
    subtitle: row.subtitle as string,
    duration: row.duration as string,
    icon: row.icon as string,
    color: row.color as string,
    xpReward: row.xp_reward as number,
    content: row.content as string[],
    quiz: row.quiz as Lesson["quiz"],
  };
}

function mapSimulation(row: Record<string, unknown>): Simulation {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    difficulty: row.difficulty as 1 | 2 | 3,
    xpReward: row.xp_reward as number,
    category: row.category as string,
    steps: row.steps as Simulation["steps"],
  };
}

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

  useEffect(() => {
    let cancelled = false;

    async function fetchContent() {
      setIsLoading(true);
      setError(null);

      try {
        const [missionsRes, lessonsRes, simsRes] = await Promise.all([
          supabase
            .from("missions")
            .select("*")
            .eq("is_active", true)
            .order("order_index"),
          supabase
            .from("lessons")
            .select("*")
            .eq("is_active", true)
            .order("order_index"),
          supabase
            .from("simulations")
            .select("*")
            .eq("is_active", true)
            .order("order_index"),
        ]);

        if (cancelled) return;

        if (missionsRes.error) throw missionsRes.error;
        if (lessonsRes.error) throw lessonsRes.error;
        if (simsRes.error) throw simsRes.error;

        const fetchedMissions = (missionsRes.data ?? []).map(mapMission);
        const fetchedLessons = (lessonsRes.data ?? []).map(mapLesson);
        const fetchedSims = (simsRes.data ?? []).map(mapSimulation);

        const lockedM = (missionsRes.data ?? [])
          .filter((r) => (r.required_xp as number) > userXP)
          .map((r) => r.id as string);
        const lockedL = (lessonsRes.data ?? [])
          .filter((r) => (r.required_xp as number) > userXP)
          .map((r) => r.id as string);
        const lockedS = (simsRes.data ?? [])
          .filter((r) => (r.required_xp as number) > userXP)
          .map((r) => r.id as string);

        setMissions(fetchedMissions.length > 0 ? fetchedMissions : MISSIONS);
        setLessons(fetchedLessons.length > 0 ? fetchedLessons : LESSONS);
        setSimulations(fetchedSims.length > 0 ? fetchedSims : SIMULATIONS);
        setLockedMissionIds(lockedM);
        setLockedLessonIds(lockedL);
        setLockedSimulationIds(lockedS);
      } catch (err) {
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

export function useContent() {
  return useContext(ContentContext);
}
