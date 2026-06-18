/**
 * useProfile — Profil ekranı için türetilmiş verileri hesaplar.
 *
 * UserContext'teki ham verileri (xp, completedMissions, badges…)
 * profil ekranının ihtiyaç duyduğu görüntülenmeye hazır forma dönüştürür.
 */

import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { RANKS, useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";

export function useProfile() {
  const insets = useSafeAreaInsets();
  const user = useUser();
  const colors = useColors();

  /** Web'de navigasyon çubuğu yüksekliği için minimum 67px */
  const topPadding =
    Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  /** RANKS dizisindeki mevcut rütbenin indeksi — ilerleme göstergesi için */
  const rankIdx = RANKS.indexOf(user.rank);

  /**
   * Profil istatistik kartlarının verisi.
   * Her öğe: icon (Feather), color (hex), value (gösterilecek metin), label
   */
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
      /** Yalnızca kazanılmış rozet sayısını göster */
      value: String(user.getBadges().filter((b) => b.earned).length),
      label: "Rozet",
    },
  ];

  return { topPadding, rankIdx, statItems, user };
}
