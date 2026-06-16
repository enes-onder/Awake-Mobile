import { RANKS } from "@/context/UserContext";

export function getRankColor(xp: number): string {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i].color;
  }
  return RANKS[0].color;
}

export function getRankName(xp: number): string {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i].name;
  }
  return RANKS[0].name;
}

export const MEDAL_CONFIG = [
  { rank: 1, emoji: "🥇", color: "#FFD700", bg: "#FFD70018" },
  { rank: 2, emoji: "🥈", color: "#C0C0C0", bg: "#C0C0C018" },
  { rank: 3, emoji: "🥉", color: "#CD7F32", bg: "#CD7F3218" },
] as const;
