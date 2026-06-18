/**
 * colors — Uygulamanın renk paleti ve köşe yarıçapı sabitleri.
 *
 * Uygulama sabit olarak koyu (dark) tema kullanır; useColors hook'u
 * her zaman bu nesneyi döndürür.
 */

const colors = {
  /** Koyu tema renk değerleri */
  dark: {
    text: "#E8EDF5",
    tint: "#2B7FFF",
    background: "#070B14",
    foreground: "#E8EDF5",
    /** Kart arka planı */
    card: "#0F1623",
    cardForeground: "#E8EDF5",
    /** Ana vurgu rengi — butonlar, aktif ikonlar */
    primary: "#2B7FFF",
    primaryForeground: "#FFFFFF",
    secondary: "#162035",
    secondaryForeground: "#A8B2C3",
    muted: "#162035",
    /** Soluk metin, placeholder'lar */
    mutedForeground: "#5C6B82",
    /** Mavi-cyan vurgu */
    accent: "#00D4FF",
    accentForeground: "#070B14",
    /** Hata ve tehlike durumları */
    destructive: "#FF3B30",
    destructiveForeground: "#FFFFFF",
    /** Kenar çizgileri ve ayraçlar */
    border: "#1B2A42",
    input: "#1B2A42",
    /** Başarı durumu — yeşil */
    success: "#00C851",
    /** Uyarı durumu — turuncu */
    warning: "#FF9500",
    /** Sahte içerik etiketi rengi */
    fake: "#FF3B30",
    /** Gerçek içerik etiketi rengi */
    real: "#00C851",
    /** Rütbe rozeti arka planı */
    rankBg: "#0F1A30",
  },
  /** Bileşen köşe yarıçapı (px) — stil tutarlılığı için sabit tutulur */
  radius: 12,
};

export default colors;
