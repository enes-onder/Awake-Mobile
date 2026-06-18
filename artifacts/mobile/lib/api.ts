/**
 * api — Uygulamanın tüm HTTP isteklerini tek noktadan yönetir.
 *
 * EXPO_PUBLIC_API_URL tanımlıysa (örn. geliştirme ortamında) o URL'yi,
 * tanımlı değilse (web önizlemesinde) /api ön ekini kullanır.
 */

/** API sunucusunun taban URL'si; ortam değişkeninden okunur */
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

/**
 * GET isteği yapar ve JSON yanıtı T tipine parse eder.
 * @param path  — /missions, /lessons gibi API yolu (başında / ile)
 */
async function get<T>(path: string): Promise<T> {
  const url = BASE_URL ? `${BASE_URL}${path}` : `/api${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

/**
 * POST isteği yapar ve JSON yanıtı T tipine parse eder.
 * @param path  — /profiles/upsert gibi API yolu
 * @param body  — JSON olarak gönderilecek istek gövdesi
 */
async function post<T>(path: string, body: unknown): Promise<T> {
  const url = BASE_URL ? `${BASE_URL}${path}` : `/api${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

/** Liderlik tablosu için tek bir kullanıcı satırı */
export interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  streak: number;
  level: number;
}

/**
 * Uygulamanın dışarıya açık API metotları.
 * Tüm bileşen ve hook'lar bu nesneyi kullanır; doğrudan fetch çağrısı yapmamalılar.
 */
export const api = {
  /** Tüm aktif vakalar listesini getirir */
  getMissions: () => get<unknown[]>("/missions"),

  /** Tüm aktif dersler listesini getirir */
  getLessons: () => get<unknown[]>("/lessons"),

  /** Tüm aktif simülasyonlar listesini getirir */
  getSimulations: () => get<unknown[]>("/simulations"),

  /**
   * Liderlik tablosunu getirir.
   * @param limit — Maksimum kayıt sayısı (varsayılan: 50)
   */
  getLeaderboard: (limit = 50) => get<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`),

  /**
   * Kullanıcı profilini sunucu tarafına upsert eder (oluştur veya güncelle).
   * XP, streak ve seviye bilgilerini PostgreSQL veritabanıyla senkronize eder.
   */
  syncProfile: (data: {
    username: string;
    xp: number;
    streak: number;
    level: number;
    bio?: string;
    favoriteTopic?: string;
  }) => post<{ ok: boolean }>("/profiles/upsert", data),
};
