import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ContentProvider } from "@/context/ContentContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";

function ContentProviderWithXP({ children }: { children: React.ReactNode }) {
  const { xp } = useUser();
  return <ContentProvider userXP={xp}>{children}</ContentProvider>;
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function NavController() {
  const { isLoading, username, authUser, isAnonymous } = useUser();
  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;
    if (isLoading) return;
    const inOnboarding = segments[0] === "onboarding";

    if (!authUser) {
      if (!inOnboarding) router.replace("/onboarding");
    } else if (!username) {
      if (!inOnboarding) router.replace("/onboarding");
    } else {
      if (inOnboarding && !isAnonymous) router.replace("/(tabs)");
    }
  }, [navigationState?.key, isLoading, username, authUser, isAnonymous]);

  return null;
}

function DeepLinkHandler() {
  useEffect(() => {
    const handleUrl = async (url: string) => {
      if (url.includes("access_token") || url.includes("code=")) {
        await supabase.auth.exchangeCodeForSession(url);
      }
    };

    const subscription = Linking.addEventListener("url", ({ url }) => {
      handleUrl(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleUrl(url);
    });

    return () => subscription.remove();
  }, []);

  return null;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
      <Stack.Screen name="onboarding" options={{ gestureEnabled: false }} />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
      <Stack.Screen name="edit-profile" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <UserProvider>
                <ContentProviderWithXP>
                  <DeepLinkHandler />
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
