const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "";

async function get<T>(path: string): Promise<T> {
  const url = BASE_URL ? `${BASE_URL}${path}` : `/api${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${path}`);
  }
  return res.json() as Promise<T>;
}

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

export interface LeaderboardEntry {
  id: string;
  username: string;
  xp: number;
  streak: number;
  level: number;
}

export const api = {
  getMissions: () => get<unknown[]>("/missions"),
  getLessons: () => get<unknown[]>("/lessons"),
  getSimulations: () => get<unknown[]>("/simulations"),
  getLeaderboard: (limit = 50) => get<LeaderboardEntry[]>(`/leaderboard?limit=${limit}`),
  syncProfile: (data: {
    username: string;
    xp: number;
    streak: number;
    level: number;
    bio?: string;
    favoriteTopic?: string;
  }) => post<{ ok: boolean }>("/profiles/upsert", data),
};
