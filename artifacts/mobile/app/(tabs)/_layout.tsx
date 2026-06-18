/**
 * (tabs)/_layout.tsx — Alt sekme navigasyonu layout'u.
 *
 * Platform tespitine göre iki farklı implementasyon seçilir:
 *  - iOS 26+ (Liquid Glass mevcut): NativeTabLayout — sistem native sekme çubuğu
 *  - Diğer platformlar (Android, web, eski iOS): ClassicTabLayout — Expo Router Tabs
 *
 * Sekmeler: Karargah (index) · Lab · Akademi · Profil
 *
 * iOS için SF Symbols, Android/web için Feather ikonları kullanılır.
 * iOS'ta tab bar BlurView ile şeffaf; web ve Android'de sabit arka plan rengi.
 */

import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";

import { useColors } from "@/hooks/useColors";

/**
 * iOS 26+ Liquid Glass sekmeli navigasyon.
 * SF Symbol ikon adları kullanılır; sistem tarafından render edilir.
 */
function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Karargah</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="lab">
        <Icon sf={{ default: "flask", selected: "flask.fill" }} />
        <Label>Lab</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="academy">
        <Icon sf={{ default: "graduationcap", selected: "graduationcap.fill" }} />
        <Label>Akademi</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person", selected: "person.fill" }} />
        <Label>Profil</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

/**
 * Android, web ve eski iOS için klasik Expo Router sekme navigasyonu.
 * iOS'ta BlurView; web'de sabit renk; Android'de şeffaf arka plan kullanılır.
 */
function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          /** Web'de yüksek sekme çubuğu — tarayıcı navigasyonuyla çakışmayı önler */
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            /** iOS: Bulanık cam efekti */
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            /** Web: Düz arka plan rengi */
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Karargah",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="house.fill" tintColor={color} size={22} />
            ) : (
              <Feather name="home" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: "Lab",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="flask.fill" tintColor={color} size={22} />
            ) : (
              <Feather name="activity" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="academy"
        options={{
          title: "Akademi",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="graduationcap.fill" tintColor={color} size={22} />
            ) : (
              <Feather name="book-open" size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.fill" tintColor={color} size={22} />
            ) : (
              <Feather name="user" size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

/**
 * Tab layout seçici — Liquid Glass kullanılabilirse native,
 * aksi takdirde klasik Expo Router tab navigasyonu kullanır.
 */
export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
