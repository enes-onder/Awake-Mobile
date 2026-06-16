import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";

export type RankName =
  | "Çaylak"
  | "Araştırmacı"
  | "Analist"
  | "Kıdemli Analist"
  | "Baş Dedektif";

export interface Rank {
  name: RankName;
  minXP: number;
  maxXP: number;
  color: string;
  icon: string;
}

export const RANKS: Rank[] = [
  { name: "Çaylak", minXP: 0, maxXP: 149, color: "#8892A4", icon: "user" },
  { name: "Araştırmacı", minXP: 150, maxXP: 399, color: "#00C851", icon: "search" },
  { name: "Analist", minXP: 400, maxXP: 799, color: "#2B7FFF", icon: "bar-chart-2" },
  { name: "Kıdemli Analist", minXP: 800, maxXP: 1499, color: "#9B59B6", icon: "award" },
  { name: "Baş Dedektif", minXP: 1500, maxXP: 9999, color: "#FF9500", icon: "shield" },
];

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
}

export const ALL_BADGES: BadgeData[] = [
  { id: "first_case", name: "İlk Vaka", description: "İlk vakanı çözdün", icon: "star", color: "#FFD700", earned: false },
  { id: "streak_3", name: "Ateş Hattı", description: "3 gün üst üste oynadın", icon: "zap", color: "#FF6B35", earned: false },
  { id: "streak_7", name: "Haftalık Seri", description: "7 gün üst üste oynadın", icon: "trending-up", color: "#FF3B30", earned: false },
  { id: "lab_master", name: "Lab Ustası", description: "10 vaka tamamladın", icon: "award", color: "#2B7FFF", earned: false },
  { id: "truth_seeker", name: "Gerçek Avcısı", description: "5 sahte haberi tespit ettin", icon: "eye", color: "#9B59B6", earned: false },
  { id: "analyst", name: "Analist Rozeti", description: "Analist rütbesine ulaştın", icon: "bar-chart-2", color: "#00C851", earned: false },
  { id: "accuracy_90", name: "Keskin Nişancı", description: "%90 doğruluk oranına ulaştın", icon: "crosshair", color: "#FF3B30", earned: false },
  { id: "lesson_3", name: "Öğrenci", description: "3 ders tamamladın", icon: "book-open", color: "#00D4FF", earned: false },
];

interface UserState {
  username: string;
  bio: string;
  favoriteTopic: string;
  usernameLastChanged: string | null;
  xp: number;
  completedMissions: string[];
  completedLessons: string[];
  correctAnswers: number;
  totalAnswers: number;
  fakesDetected: number;
  badges: string[];
  streak: number;
  lastPlayDate: string | null;
  lastLoginDate: string | null;
}

interface UserContextType extends UserState {
  rank: Rank;
  nextRank: Rank | null;
  xpProgress: number;
  accuracyRate: number;
  dailyPlayedToday: boolean;
  dailyXPMultiplier: number;
  streakBonusEarned: number;
  earnXP: (amount: number) => void;
  completeMission: (missionId: string, correct: boolean) => void;
  completeLesson: (lessonId: string) => void;
  earnBadge: (badgeId: string) => void;
  setUsername: (name: string) => void;
  updateProfile: (fields: { bio?: string; favoriteTopic?: string }) => void;
  canChangeUsername: () => boolean;
  daysUntilUsernameChange: () => number;
  isLoading: boolean;
  getBadges: () => BadgeData[];
  isAnonymous: boolean;
  signOut: () => Promise<void>;
}

const defaultState: UserState = {
  username: "",
  bio: "",
  favoriteTopic: "",
  usernameLastChanged: null,
  xp: 0,
  completedMissions: [],
  completedLessons: [],
  correctAnswers: 0,
  totalAnswers: 0,
  fakesDetected: 0,
  badges: [],
  streak: 0,
  lastPlayDate: null,
  lastLoginDate: null,
};

const STORAGE_KEY = "@dogruluk_user_v2";
const STREAK_BONUS_XP = 10;

const UserContext = createContext<UserContextType | undefined>(undefined);

function todayStr() {
  return new Date().toDateString();
}

function calcStreak(lastPlayDate: string | null, currentStreak: number): { streak: number; lastPlayDate: string } {
  const today = todayStr();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  if (lastPlayDate === today) {
    return { streak: currentStreak, lastPlayDate: today };
  } else if (lastPlayDate === yesterday) {
    return { streak: currentStreak + 1, lastPlayDate: today };
  } else {
    return { streak: 1, lastPlayDate: today };
  }
}

function getRank(xp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i];
  }
  return RANKS[0];
}

function computeLevel(xp: number): number {
  const rank = getRank(xp);
  return RANKS.indexOf(rank) + 1;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  const [streakBonusEarned, setStreakBonusEarned] = useState(0);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (!mounted) return;

      let loaded: UserState = defaultState;
      if (raw) {
        try {
          loaded = { ...defaultState, ...JSON.parse(raw) };
        } catch {}
      }

      const today = todayStr();
      if (loaded.username && loaded.lastLoginDate !== today) {
        const { streak, lastPlayDate } = calcStreak(loaded.lastPlayDate, loaded.streak);
        loaded = {
          ...loaded,
          xp: loaded.xp + STREAK_BONUS_XP,
          streak,
          lastPlayDate,
          lastLoginDate: today,
        };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loaded)).catch(() => {});
        setStreakBonusEarned(STREAK_BONUS_XP);
      }

      setState(loaded);
      setIsLoading(false);
    }).catch(() => {
      if (mounted) setIsLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const syncToDB = useCallback((s: UserState) => {
    if (!s.username) return;
    api.syncProfile({
      username: s.username,
      xp: s.xp,
      streak: s.streak,
      level: computeLevel(s.xp),
      bio: s.bio,
      favoriteTopic: s.favoriteTopic,
    }).catch(() => {});
  }, []);

  const save = useCallback(async (next: UserState, sync = true) => {
    setState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    if (sync) syncToDB(next);
  }, [syncToDB]);

  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
    setStreakBonusEarned(0);
  }, []);

  const rank = getRank(state.xp);
  const rankIdx = RANKS.indexOf(rank);
  const nextRank = rankIdx < RANKS.length - 1 ? RANKS[rankIdx + 1] : null;
  const xpInRange = state.xp - rank.minXP;
  const rangeSize = rank.maxXP - rank.minXP + 1;
  const xpProgress = Math.min(xpInRange / rangeSize, 1);
  const accuracyRate =
    state.totalAnswers > 0
      ? Math.round((state.correctAnswers / state.totalAnswers) * 100)
      : 0;
  const dailyPlayedToday = state.lastPlayDate === todayStr();
  const dailyXPMultiplier = dailyPlayedToday ? 1 : 2;
  const isAnonymous = !state.username;

  const earnXP = useCallback(
    (amount: number) => {
      const next = { ...state, xp: Math.max(0, state.xp + amount) };
      save(next);
    },
    [state, save]
  );

  const completeMission = useCallback(
    (missionId: string, correct: boolean) => {
      const alreadyDone = state.completedMissions.includes(missionId);
      const newCompleted = alreadyDone
        ? state.completedMissions
        : [...state.completedMissions, missionId];
      const newCorrect = correct ? state.correctAnswers + 1 : state.correctAnswers;
      const newTotal = state.totalAnswers + 1;
      const newFakes = correct && !alreadyDone
        ? state.fakesDetected + 1
        : state.fakesDetected;
      const newBadges = [...state.badges];

      if (!alreadyDone && newCompleted.length === 1 && !newBadges.includes("first_case")) {
        newBadges.push("first_case");
      }
      if (!alreadyDone && newCompleted.length >= 10 && !newBadges.includes("lab_master")) {
        newBadges.push("lab_master");
      }
      if (accuracyRate >= 90 && newTotal >= 5 && !newBadges.includes("accuracy_90")) {
        newBadges.push("accuracy_90");
      }
      if (newFakes >= 5 && !newBadges.includes("truth_seeker")) {
        newBadges.push("truth_seeker");
      }

      const { streak, lastPlayDate } = calcStreak(state.lastPlayDate, state.streak);
      if (streak >= 3 && !newBadges.includes("streak_3")) newBadges.push("streak_3");
      if (streak >= 7 && !newBadges.includes("streak_7")) newBadges.push("streak_7");

      if (rank.name === "Analist" && !newBadges.includes("analyst")) {
        newBadges.push("analyst");
      }

      save({
        ...state,
        completedMissions: newCompleted,
        correctAnswers: newCorrect,
        totalAnswers: newTotal,
        fakesDetected: newFakes,
        badges: newBadges,
        streak,
        lastPlayDate,
      });
    },
    [state, save, accuracyRate, rank]
  );

  const completeLesson = useCallback(
    (lessonId: string) => {
      if (state.completedLessons.includes(lessonId)) return;
      const newLessons = [...state.completedLessons, lessonId];
      const newBadges = [...state.badges];
      if (newLessons.length >= 3 && !newBadges.includes("lesson_3")) {
        newBadges.push("lesson_3");
      }
      const { streak, lastPlayDate } = calcStreak(state.lastPlayDate, state.streak);
      save({ ...state, completedLessons: newLessons, badges: newBadges, streak, lastPlayDate });
    },
    [state, save]
  );

  const earnBadge = useCallback(
    (badgeId: string) => {
      if (!state.badges.includes(badgeId)) {
        save({ ...state, badges: [...state.badges, badgeId] });
      }
    },
    [state, save]
  );

  const canChangeUsername = useCallback(() => {
    if (!state.usernameLastChanged) return true;
    const last = new Date(state.usernameLastChanged);
    const now = new Date();
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 30;
  }, [state.usernameLastChanged]);

  const daysUntilUsernameChange = useCallback(() => {
    if (!state.usernameLastChanged) return 0;
    const last = new Date(state.usernameLastChanged);
    const now = new Date();
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(30 - diffDays));
  }, [state.usernameLastChanged]);

  const setUsername = useCallback(
    (name: string) => {
      const next = { ...state, username: name, usernameLastChanged: new Date().toISOString() };
      save(next);
    },
    [state, save]
  );

  const updateProfile = useCallback(
    (fields: { bio?: string; favoriteTopic?: string }) => {
      save({ ...state, ...fields });
    },
    [state, save]
  );

  const getBadges = useCallback((): BadgeData[] => {
    return ALL_BADGES.map((b) => ({ ...b, earned: state.badges.includes(b.id) }));
  }, [state.badges]);

  return (
    <UserContext.Provider
      value={{
        ...state,
        rank,
        nextRank,
        xpProgress,
        accuracyRate,
        dailyPlayedToday,
        dailyXPMultiplier,
        streakBonusEarned,
        earnXP,
        completeMission,
        completeLesson,
        earnBadge,
        setUsername,
        updateProfile,
        canChangeUsername,
        daysUntilUsernameChange,
        isLoading,
        getBadges,
        isAnonymous,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
