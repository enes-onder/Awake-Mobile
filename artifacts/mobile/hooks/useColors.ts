/**
 * useColors — Uygulamanın koyu tema renklerini döndürür.
 *
 * Uygulama sabit olarak koyu tema kullandığından bu hook
 * her zaman colors.dark + radius değerlerini döndürür.
 * Bileşenlerde doğrudan renk kodları yerine bu hook kullanılmalıdır.
 */

import colors from "@/constants/colors";

export function useColors() {
  return { ...colors.dark, radius: colors.radius };
}
