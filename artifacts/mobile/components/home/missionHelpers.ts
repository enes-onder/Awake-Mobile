export const TYPE_ICONS: Record<string, string> = {
  photo: "image",
  headline: "type",
  quote: "message-square",
  stats: "bar-chart-2",
  video: "video",
};

const DIFF_COLORS = ["", "#00C851", "#FF9500", "#FF3B30"] as const;
const DIFF_LABELS = ["", "Kolay", "Orta", "Zor"] as const;

export function diffColor(d: number): string {
  return DIFF_COLORS[d] ?? "#00C851";
}

export function diffLabel(d: number): string {
  return DIFF_LABELS[d] ?? "Kolay";
}
