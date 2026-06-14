import { useWindowDimensions } from "react-native";

export function useResponsive() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const isDesktop = width >= 1024;
  const scale = Math.min(Math.max(width / 390, 0.9), 1.25);

  return {
    width,
    isTablet,
    isDesktop,
    hp: isDesktop ? 48 : isTablet ? 32 : 20,
    maxW: isTablet ? Math.min(width - 64, 640) : undefined,
    fs: (base: number) => Math.round(base * scale),
    sp: (base: number) => Math.round(base * Math.min(scale, 1.15)),
    scale,
  };
}
