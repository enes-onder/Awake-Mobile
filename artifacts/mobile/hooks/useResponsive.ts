/**
 * useResponsive — Ekran genişliğine göre duyarlı tasarım değerleri üretir.
 *
 * Telefon (< 600px), tablet (600–1023px) ve masaüstü (≥ 1024px)
 * kırılım noktalarını destekler.
 *
 * Kullanım:
 *   const { fs, sp, isTablet, maxW } = useResponsive();
 *   style={{ fontSize: fs(16), padding: sp(12) }}
 */

import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width } = useWindowDimensions();

  const isTablet = width >= 600;
  const isDesktop = width >= 1024;

  /**
   * Ölçekleme katsayısı — 390px (iPhone 14) referans genişlik.
   * Minimum 0.9x, maksimum 1.25x ile sınırlandırılır.
   */
  const scale = Math.min(Math.max(width / 390, 0.9), 1.25);

  return {
    /** Mevcut pencere genişliği (px) */
    width,
    isTablet,
    isDesktop,
    /** Yatay dolgu — masaüstü: 48, tablet: 32, telefon: 20 */
    hp: isDesktop ? 48 : isTablet ? 32 : 20,
    /** İçerik maksimum genişliği — tablette 640px ile sınırlı */
    maxW: isTablet ? Math.min(width - 64, 640) : undefined,
    /**
     * Duyarlı font boyutu hesaplar.
     * @param base — Referans font boyutu (px)
     */
    fs: (base: number) => Math.round(base * scale),
    /**
     * Duyarlı boşluk/dolgu hesaplar (maksimum 1.15x ile sınırlandırılır).
     * @param base — Referans boşluk değeri (px)
     */
    sp: (base: number) => Math.round(base * Math.min(scale, 1.15)),
    scale,
  };
}
