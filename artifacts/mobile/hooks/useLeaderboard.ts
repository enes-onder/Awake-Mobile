import { useEffect, useState } from "react";
import { api, type LeaderboardEntry } from "@/lib/api";

const MOCK_ENTRIES: LeaderboardEntry[] = [
  { id: "mock_1", username: "Ajan_X",      xp: 1850, streak: 12, level: 5 },
  { id: "mock_2", username: "CyberSlayer", xp: 1420, streak: 7,  level: 4 },
  { id: "mock_3", username: "RootKit_TR",  xp: 1180, streak: 5,  level: 4 },
  { id: "mock_4", username: "Dex_Hacker",  xp: 890,  streak: 3,  level: 3 },
  { id: "mock_5", username: "NeonPhantom", xp: 710,  streak: 6,  level: 3 },
  { id: "mock_6", username: "ByteHunter",  xp: 520,  streak: 2,  level: 2 },
  { id: "mock_7", username: "GizliAjan42", xp: 340,  streak: 4,  level: 2 },
  { id: "mock_8", username: "CipherGhost", xp: 195,  streak: 1,  level: 2 },
];

function mergeWithMocks(real: LeaderboardEntry[]): LeaderboardEntry[] {
  if (real.length === 0) return MOCK_ENTRIES;
  const realIds = new Set(real.map((e) => e.id));
  const extras = MOCK_ENTRIES.filter((m) => !realIds.has(m.id));
  return [...real, ...extras].sort((a, b) => b.xp - a.xp);
}

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(MOCK_ENTRIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .getLeaderboard(50)
      .then((data) => setEntries(mergeWithMocks(data)))
      .catch(() => {
        setError("Liderlik tablosu yüklenemedi.");
        setEntries(MOCK_ENTRIES);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getLeaderboard(50)
      .then((data) => { if (!cancelled) setEntries(mergeWithMocks(data)); })
      .catch(() => {
        if (!cancelled) {
          setError(null);
          setEntries(MOCK_ENTRIES);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { entries, loading, error, retry: load };
}
