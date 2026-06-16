import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RANKS, useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export function useProfile() {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const colors = useColors();

  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  const rankIdx = RANKS.indexOf(user.rank);

  const statItems = [
    {
      icon: "check-circle",
      color: colors.success,
      value: String(user.completedMissions.length),
      label: "Çözülen Vaka",
    },
    {
      icon: "crosshair",
      color: colors.primary,
      value: `${user.accuracyRate}%`,
      label: "Doğruluk",
    },
    {
      icon: "zap",
      color: colors.warning,
      value: String(user.xp),
      label: "Toplam XP",
    },
    {
      icon: "award",
      color: "#9B59B6",
      value: String(user.getBadges().filter((b) => b.earned).length),
      label: "Rozet",
    },
  ];

  return { topPadding, rankIdx, statItems, user };
}
