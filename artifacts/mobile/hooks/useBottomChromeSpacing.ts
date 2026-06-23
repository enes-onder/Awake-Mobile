/**
 * useBottomChromeSpacing — Alt sekme çubuğu ile ekran içeriği arasındaki
 * güvenli boşluğu hesaplar.
 *
 * Tab bar `position: "absolute"` olduğu için tam ekran görünümlerinde
 * (ActiveMissionView, MissionResultView, LessonPlayer) alt dolgu elle
 * yönetilmek zorundadır. Bu hook, platform bağımsız tek doğru kaynaktır.
 *
 * Hesap: insets.bottom (home indicator) + TAB_BAR_CONTENT_HEIGHT (49px) + extra
 * Web:   WEB_BOTTOM_CHROME_SPACING sabit değeri (tarayıcı UI'ına karşı koruma)
 */

import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** Standart iOS/Android tab bar içerik yüksekliği (px).
 *  Expo Router ClassicTabLayout ve NativeTabs için geçerlidir. */
const TAB_BAR_CONTENT_HEIGHT = 49;

/** Web'de tarayıcı navigasyon çubuğunu da karşılamak için kullanılan sabit. */
const WEB_BOTTOM_CHROME_SPACING = 100;

/** Dokunma hedefine ek dokunmatik dolgu (varsayılan 8px). */
const DEFAULT_EXTRA_PADDING = 8;

/**
 * Alt sekme çubuğu mesafesini döndürür.
 *
 * @param extra — Tab bar yüksekliğinin üzerine eklenen ek dolgu (px). Varsayılan: 8.
 * @returns Tam ekran görünümlerde `paddingBottom` veya `safeBottom` olarak
 *          kullanılmaya hazır piksel değeri.
 */
export function useBottomChromeSpacing(extra: number = DEFAULT_EXTRA_PADDING): number {
  const insets = useSafeAreaInsets();

  if (Platform.OS === "web") {
    return WEB_BOTTOM_CHROME_SPACING;
  }

  return insets.bottom + TAB_BAR_CONTENT_HEIGHT + extra;
}
