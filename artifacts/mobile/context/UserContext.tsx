/**
 * UserContext — Kullanıcının tüm oyun state'ini yönetir.
 *
 * Veriler AsyncStorage'da kalıcı olarak saklanır ve her state
 * değişiminde arka planda API sunucusuna senkronize edilir.
 *
 * Sağlanan değerler:
 *  - Profil: username, bio, favoriteTopic
 *  - İlerleme: xp, level, streak, completedMissions, completedLessons
 *  - Rozet sistemi: ALL_BADGES, getBadges()
 *  - Rütbe sistemi: rank, nextRank, xpProgress
 *  - Eylemler: earnXP, completeMission, completeLesson, signOut …
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/lib/api";

// ─── Rütbe Tanımları ──────────────────────────────────────────────────────

export type RankName =
  | "Çaylak"
  | "Araştırmacı"
  | "Analist"
  | "Kıdemli Analist"
  | "Baş Dedektif";

export interface Rank {
  name: RankName;
  /** Bu rütbenin başladığı minimum XP değeri */
  minXP: number;
  /** Bu rütbenin bittiği maksimum XP değeri */
  maxXP: number;
  /** Rütbe rozeti rengi */
  color: string;
  /** Feather icon adı */
  icon: string;
}

/** Artan XP sırasıyla tüm rütbeler */
export const RANKS: Rank[] = [
  { name: "Çaylak",          minXP: 0,    maxXP: 149,  color: "#8892A4", icon: "user" },
  { name: "Araştırmacı",     minXP: 150,  maxXP: 399,  color: "#00C851", icon: "search" },
  { name: "Analist",         minXP: 400,  maxXP: 799,  color: "#2B7FFF", icon: "bar-chart-2" },
  { name: "Kıdemli Analist", minXP: 800,  maxXP: 1499, color: "#9B59B6", icon: "award" },
  { name: "Baş Dedektif",    minXP: 1500, maxXP: 9999, color: "#FF9500", icon: "shield" },
];

// ─── Rozet Tanımları ───────────────────────────────────────────────────────

export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  /** Kullanıcı bu rozeti kazandıysa true (runtime'da hesaplanır) */
  earned: boolean;
}

/** Oyundaki tüm rozetlerin şablonu — earned alanı her zaman false başlar */
export const ALL_BADGES: BadgeData[] = [
  { id: "first_case",   name: "İlk Vaka",        description: "İlk vakanı çözdün",             icon: "star",        color: "#FFD700", earned: false },
  { id: "streak_3",     name: "Ateş Hattı",      description: "3 gün üst üste oynadın",        icon: "zap",         color: "#FF6B35", earned: false },
  { id: "streak_7",     name: "Haftalık Seri",    description: "7 gün üst üste oynadın",        icon: "trending-up", color: "#FF3B30", earned: false },
  { id: "lab_master",   name: "Lab Ustası",       description: "10 vaka tamamladın",            icon: "award",       color: "#2B7FFF", earned: false },
  { id: "truth_seeker", name: "Gerçek Avcısı",   description: "5 sahte haberi tespit ettin",   icon: "eye",         color: "#9B59B6", earned: false },
  { id: "analyst",      name: "Analist Rozeti",  description: "Analist rütbesine ulaştın",     icon: "bar-chart-2", color: "#00C851", earned: false },
  { id: "accuracy_90",  name: "Keskin Nişancı",  description: "%90 doğruluk oranına ulaştın",  icon: "crosshair",   color: "#FF3B30", earned: false },
  { id: "lesson_3",     name: "Öğrenci",         description: "3 ders tamamladın",             icon: "book-open",   color: "#00D4FF", earned: false },
];

// ─── State Tipleri ─────────────────────────────────────────────────────────

/** AsyncStorage'a yazılan ham kullanıcı verisi */
interface UserState {
  username: string;
  bio: string;
  favoriteTopic: string;
  /** ISO tarih string'i — 30 günlük kullanıcı adı kilidi için kullanılır */
  usernameLastChanged: string | null;
  xp: number;
  completedMissions: string[];
  completedLessons: string[];
  /** Toplam doğru cevap sayısı (doğruluk oranı hesabı için) */
  correctAnswers: number;
  /** Toplam cevaplanan soru sayısı */
  totalAnswers: number;
  /** Tespit edilen sahte haber sayısı */
  fakesDetected: number;
  /** Kazanılmış rozet id'leri */
  badges: string[];
  streak: number;
  /** Son oynama tarihi (new Date().toDateString() formatı) */
  lastPlayDate: string | null;
  /** Günlük giriş bonusu tekrarını önlemek için son giriş tarihi */
  lastLoginDate: string | null;
  isGuestMode: boolean;
}

/** Context dışarıya açtığı tüm değerler (state + türetilen değerler + eylemler) */
interface UserContextType extends UserState {
  rank: Rank;
  nextRank: Rank | null;
  /** Mevcut rütbe içindeki ilerleme oranı (0–1) */
  xpProgress: number;
  /** Toplam doğruluk yüzdesi (0–100) */
  accuracyRate: number;
  /** Bugün en az bir aktivite tamamlandıysa true */
  dailyPlayedToday: boolean;
  /** İlk günlük aktivitede XP 2x olur */
  dailyXPMultiplier: number;
  /** Uygulama açılışında kazanılan streak bonus XP miktarı (toast için) */
  streakBonusEarned: number;
  earnXP: (amount: number) => void;
  completeMission: (missionId: string, correct: boolean, xpDelta: number, wasFakeDetected?: boolean) => void;
  completeLesson: (lessonId: string, xpDelta?: number) => void;
  earnBadge: (badgeId: string) => void;
  setUsername: (name: string) => void;
  updateProfile: (fields: { bio?: string; favoriteTopic?: string }) => void;
  /** Kullanıcı adı son 30 gün içinde değiştirilmediyse true döner */
  canChangeUsername: () => boolean;
  /** Kullanıcı adı değiştirilebilmesine kaç gün kaldığını döner */
  daysUntilUsernameChange: () => number;
  /** AsyncStorage yükleme tamamlanana kadar true */
  isLoading: boolean;
  /** ALL_BADGES listesini kullanıcının kazandığı rozetleri işaretleyerek döner */
  getBadges: () => BadgeData[];
  /** isGuestMode takma adı */
  isAnonymous: boolean;
  /** AsyncStorage'ı temizler ve state'i sıfırlar */
  signOut: () => Promise<void>;
}

// ─── Sabitler ─────────────────────────────────────────────────────────────

/** AsyncStorage anahtarı — versiyon numarası şema değişikliklerinde güncellenmeli */
const STORAGE_KEY = "@dogruluk_user_v2";

/** Her uygulama açılışında kazanılan günlük streak bonus XP */
const STREAK_BONUS_XP = 10;

/** Yeni kullanıcı için varsayılan boş state */
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
  isGuestMode: true,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// ─── Yardımcı Fonksiyonlar ─────────────────────────────────────────────────

/** Bugünün tarihini "Day Mon DD YYYY" formatında döner (toDateString ile karşılaştırma için) */
function todayStr() {
  return new Date().toDateString();
}

/**
 * Günlük streak hesaplar:
 * - Bugün zaten oynanmışsa streak değişmez
 * - Dün oynanmışsa streak +1
 * - Daha önce oynanmamışsa veya gün atlandıysa streak 1'e sıfırlanır
 */
function calcStreak(
  lastPlayDate: string | null,
  currentStreak: number,
): { streak: number; lastPlayDate: string } {
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

/** XP değerine göre mevcut rütbeyi döner (sondan başa tarar) */
function getRank(xp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i];
  }
  return RANKS[0];
}

/** XP'den seviye numarası hesaplar (rütbe indeksi + 1) */
function computeLevel(xp: number): number {
  const rank = getRank(xp);
  return RANKS.indexOf(rank) + 1;
}

// ─── Provider ─────────────────────────────────────────────────────────────

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserState>(defaultState);
  const [isLoading, setIsLoading] = useState(true);
  /** Uygulama açılışındaki streak bonus miktarı — CelebrationOverlay için */
  const [streakBonusEarned, setStreakBonusEarned] = useState(0);

  /** Uygulama açılışında AsyncStorage'dan kullanıcı verisini yükler ve streak bonusu uygular */
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

      /** Bugün ilk girişse streak bonusu ver.
       * Yalnızca xp ve lastLoginDate güncellenir.
       * lastPlayDate ve streak gerçek oyun aktivitesinde değişir;
       * burada değiştirilmesi dailyXPMultiplier'ı bozar. */
      const today = todayStr();
      if (loaded.username && loaded.lastLoginDate !== today) {
        loaded = {
          ...loaded,
          xp: loaded.xp + STREAK_BONUS_XP,
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

  /** Kullanıcı state'ini PostgreSQL'e arka planda senkronize eder (hata sessizce yutulur) */
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

  /**
   * State'i günceller, AsyncStorage'a yazar ve opsiyonel olarak DB'ye senkronize eder.
   * Doğrudan next nesnesi verildiğinde kullanılır (setUsername, updateProfile vb.)
   */
  const save = useCallback(async (next: UserState, sync = true) => {
    setState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
    if (sync) syncToDB(next);
  }, [syncToDB]);

  /**
   * Fonksiyonel updater ile atomik state güncellemesi yapar.
   * setState(prev => ...) kullandığı için stale closure riski yoktur.
   * Ardışık çağrılarda önceki güncelleme ezilmez.
   */
  const saveUpdater = useCallback(
    (updater: (prev: UserState) => UserState, sync = true) => {
      setState(prev => {
        const next = updater(prev);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        if (sync) syncToDB(next);
        return next;
      });
    },
    [syncToDB]
  );

  /** AsyncStorage'daki kullanıcı verisini siler ve state'i sıfırlar */
  const signOut = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setState(defaultState);
    setStreakBonusEarned(0);
  }, []);

  // ─── Türetilen Değerler ──────────────────────────────────────────────────

  const rank = getRank(state.xp);
  const rankIdx = RANKS.indexOf(rank);
  /** Bir sonraki rütbe; maksimum rütbedeyse null */
  const nextRank = rankIdx < RANKS.length - 1 ? RANKS[rankIdx + 1] : null;
  /** Bir sonraki rütbe eşiğine göre hesaplanır; maksimum rütbede sabit 1 döner */
  const rankSpan = nextRank ? nextRank.minXP - rank.minXP : 1;
  const xpProgress = nextRank
    ? Math.min(Math.max((state.xp - rank.minXP) / rankSpan, 0), 1)
    : 1;
  const accuracyRate =
    state.totalAnswers > 0
      ? Math.round((state.correctAnswers / state.totalAnswers) * 100)
      : 0;
  const dailyPlayedToday = state.lastPlayDate === todayStr();
  /** İlk günlük aktivitede 2x XP, sonraki aktivitelerde 1x */
  const dailyXPMultiplier = dailyPlayedToday ? 1 : 2;
  const isAnonymous = state.isGuestMode;

  // ─── Eylemler ────────────────────────────────────────────────────────────

  /** XP kazandırır veya düşürür; XP asla 0'ın altına düşmez.
   * saveUpdater kullanır — ipucu cezası veya anlık XP değişikliği için. */
  const earnXP = useCallback(
    (amount: number) => {
      saveUpdater(prev => ({ ...prev, xp: Math.max(0, prev.xp + amount) }));
    },
    [saveUpdater]
  );

  /**
   * Vaka tamamlandığında çağrılır.
   * xpDelta: net XP farkı (çarpan ve ipucu cezası dahil, useLabState tarafından hesaplanır)
   * wasFakeDetected: kullanıcı verdict==="fake" olan vakayı doğru tespit ettiyse true
   *
   * Tüm güncellemeler (XP, tamamlanma, istatistik, rozet, streak) tek atomik
   * saveUpdater çağrısında yapılır — stale closure riski yoktur.
   */
  const completeMission = useCallback(
    (missionId: string, correct: boolean, xpDelta: number, wasFakeDetected?: boolean) => {
      saveUpdater(prev => {
        const alreadyDone = prev.completedMissions.includes(missionId);
        /** Vaka yalnızca doğru cevap verildiğinde ve daha önce tamamlanmamışsa
         * completedMissions'a eklenir. Yanlış cevapta vaka pending listede kalır
         * ve tekrar denenebilir. */
        const newCompleted =
          correct && !alreadyDone
            ? [...prev.completedMissions, missionId]
            : prev.completedMissions;
        const newCorrect = correct ? prev.correctAnswers + 1 : prev.correctAnswers;
        const newTotal = prev.totalAnswers + 1;

        /** Sahte tespit sayacı yalnızca wasFakeDetected===true ise artar */
        const newFakes =
          wasFakeDetected && !alreadyDone
            ? prev.fakesDetected + 1
            : prev.fakesDetected;

        /** XP atomik hesap — prev'den türetilir, stale state riski yoktur */
        const newXP = Math.max(0, prev.xp + xpDelta);
        const newRank = getRank(newXP);
        const newAccuracy =
          newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0;

        const newBadges = [...prev.badges];

        /** İlk vaka rozeti */
        if (!alreadyDone && newCompleted.length === 1 && !newBadges.includes("first_case")) {
          newBadges.push("first_case");
        }
        /** 10 vaka rozeti */
        if (!alreadyDone && newCompleted.length >= 10 && !newBadges.includes("lab_master")) {
          newBadges.push("lab_master");
        }
        /** %90 doğruluk rozeti — yeni hesaplanan değerlerle kontrol edilir */
        if (newAccuracy >= 90 && newTotal >= 5 && !newBadges.includes("accuracy_90")) {
          newBadges.push("accuracy_90");
        }
        /** 5 sahte tespit rozeti */
        if (newFakes >= 5 && !newBadges.includes("truth_seeker")) {
          newBadges.push("truth_seeker");
        }

        const { streak, lastPlayDate } = calcStreak(prev.lastPlayDate, prev.streak);
        if (streak >= 3 && !newBadges.includes("streak_3")) newBadges.push("streak_3");
        if (streak >= 7 && !newBadges.includes("streak_7")) newBadges.push("streak_7");

        /** Analist rütbesi — yeni XP ile hesaplanan rütbe üzerinden kontrol edilir */
        if (newRank.name === "Analist" && !newBadges.includes("analyst")) {
          newBadges.push("analyst");
        }

        return {
          ...prev,
          xp: newXP,
          completedMissions: newCompleted,
          correctAnswers: newCorrect,
          totalAnswers: newTotal,
          fakesDetected: newFakes,
          badges: newBadges,
          streak,
          lastPlayDate,
        };
      });
    },
    [saveUpdater]
  );

  /**
   * Ders tamamlandığında çağrılır.
   * xpDelta: temel ders ödülü + quiz bonusu toplamı (academy.tsx tarafından hesaplanır)
   *
   * Tamamlanma, XP, rozet ve streak tek atomik saveUpdater çağrısında kaydedilir.
   * Zaten tamamlanmış ders için state değişmez.
   */
  const completeLesson = useCallback(
    (lessonId: string, xpDelta = 0) => {
      saveUpdater(prev => {
        /** Ders daha önce tamamlandıysa tekrar kayıt yapılmaz */
        if (prev.completedLessons.includes(lessonId)) return prev;
        const newLessons = [...prev.completedLessons, lessonId];
        const newXP = Math.max(0, prev.xp + xpDelta);
        const newBadges = [...prev.badges];
        if (newLessons.length >= 3 && !newBadges.includes("lesson_3")) {
          newBadges.push("lesson_3");
        }
        const { streak, lastPlayDate } = calcStreak(prev.lastPlayDate, prev.streak);
        return { ...prev, xp: newXP, completedLessons: newLessons, badges: newBadges, streak, lastPlayDate };
      });
    },
    [saveUpdater]
  );

  /** Belirtilen rozeti kazanılmış olarak işaretler (zaten varsa tekrar eklemez) */
  const earnBadge = useCallback(
    (badgeId: string) => {
      if (!state.badges.includes(badgeId)) {
        save({ ...state, badges: [...state.badges, badgeId] });
      }
    },
    [state, save]
  );

  /** Son kullanıcı adı değişikliğinden 30 gün geçtiyse true döner */
  const canChangeUsername = useCallback(() => {
    if (!state.usernameLastChanged) return true;
    const last = new Date(state.usernameLastChanged);
    const now = new Date();
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 30;
  }, [state.usernameLastChanged]);

  /** Kullanıcı adı değiştirilebilmesine kaç gün kaldığını döner */
  const daysUntilUsernameChange = useCallback(() => {
    if (!state.usernameLastChanged) return 0;
    const last = new Date(state.usernameLastChanged);
    const now = new Date();
    const diffDays = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
    return Math.max(0, Math.ceil(30 - diffDays));
  }, [state.usernameLastChanged]);

  /** Kullanıcı adını kaydeder ve değişiklik tarihini ISO string olarak depolar */
  const setUsername = useCallback(
    (name: string) => {
      const next = { ...state, username: name, usernameLastChanged: new Date().toISOString() };
      save(next);
    },
    [state, save]
  );

  /** Bio ve favori konu alanlarını günceller */
  const updateProfile = useCallback(
    (fields: { bio?: string; favoriteTopic?: string }) => {
      save({ ...state, ...fields });
    },
    [state, save]
  );

  /** ALL_BADGES şablonunu kopyalayıp kullanıcının kazandığı rozetleri earned=true yapar */
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

/** UserContext'e erişim hook'u — UserProvider dışında kullanılırsa hata fırlatır */
export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
