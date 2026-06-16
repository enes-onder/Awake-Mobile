import { useEffect, useState } from "react";
import { api, type LeaderboardEntry } from "@/lib/api";

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    api
      .getLeaderboard(50)
      .then((data) => setEntries(data))
      .catch(() => setError("Liderlik tablosu yüklenemedi."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api
      .getLeaderboard(50)
      .then((data) => { if (!cancelled) setEntries(data); })
      .catch(() => { if (!cancelled) setError("Liderlik tablosu yüklenemedi."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { entries, loading, error, retry: load };
}
