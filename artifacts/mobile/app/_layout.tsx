/**
 * _layout.tsx — Uygulamanın kök layout bileşeni (Expo Router giriş noktası).
 *
 * Sorumluluklar:
 *  1. Inter font ailesini yükler; yüklenene kadar splash screen gösterir.
 *  2. Tüm global provider'ları iç içe sarar (SafeArea → ErrorBoundary → QueryClient → Gesture → Keyboard → User → Content).
 *  3. NavController ile kimlik doğrulama yönlendirmesini yönetir:
 *     - username yoksa → /onboarding
 *     - username varsa → /(tabs)
 */

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ContentProvider } from "@/context/ContentContext";
import { UserProvider, useUser } from "@/context/UserContext";

/**
 * ContentProvider'ı UserContext'ten gelen güncel XP değeriyle besler.
 * UserProvider içinde olması gerektiğinden ayrı bir bileşen olarak sarılmıştır.
 */
function ContentProviderWithXP({ children }: { children: React.ReactNode }) {
  const { xp } = useUser();
  return <ContentProvider userXP={xp}>{children}</ContentProvider>;
}

/** Uygulama yüklenirken splash screen'i otomatik gizlenmesini engeller */
SplashScreen.preventAutoHideAsync();

/** TanStack Query istemcisi — tüm uygulama boyunca paylaşılır */
const queryClient = new QueryClient();

/**
 * NavController — kullanıcı oturumuna göre yönlendirme yapar.
 * Görsel çıktısı yoktur; sadece useEffect ile router.replace() çağırır.
 *
 * - Yükleme devam ediyorken hiçbir şey yapmaz (flash önleme)
 * - username boşsa /onboarding'e yönlendirir
 * - username doluysa /(tabs)'e yönlendirir
 */
function NavController() {
  const { isLoading, username } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    /** Navigasyon state henüz hazır değilse bekle */
    if (!navigationState?.key) return;
    if (isLoading) return;
    const inOnboarding = segments[0] === "onboarding";

    if (!username) {
      if (!inOnboarding) router.replace("/onboarding");
    } else {
      if (inOnboarding) router.replace("/(tabs)");
    }
  }, [navigationState?.key, isLoading, username]);

  return null;
}

/**
 * Expo Router Stack navigatörü.
 * - onboarding ve (tabs): geri swipe hareketi devre dışı
 * - edit-profile ve leaderboard: sağdan sola slide animasyonu
 */
function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="edit-profile" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="leaderboard" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}

/** Kök layout — fontlar hazır olana kadar null döner (beyaz flash önleme) */
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  /** Font yüklendi veya hata oluştuysa splash screen'i gizle */
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  /** Fontlar yüklenmeden render etme — splash screen görünür kalır */
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <UserProvider>
                <ContentProviderWithXP>
                  <NavController />
                  <RootLayoutNav />
                </ContentProviderWithXP>
              </UserProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
