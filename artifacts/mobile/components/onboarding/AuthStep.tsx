import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import type { AuthProvider, ProviderItem } from "./types";
import { ErrorBox } from "./ErrorBox";
import { OnboardingLogo } from "./OnboardingLogo";
import { styles } from "./styles";

interface AuthStepProps {
  loading: boolean;
  error: string | null;
  selectedProvider: AuthProvider | null;
  providerMap: ProviderItem[];
  handleProviderSelect: (id: AuthProvider) => void;
  handleAnonymousSignIn: () => void;
}

export function AuthStep({
  loading,
  error,
  selectedProvider,
  providerMap,
  handleProviderSelect,
  handleAnonymousSignIn,
}: AuthStepProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View entering={FadeInUp.springify()} style={styles.authStep}>
          <OnboardingLogo delay={200} />

          <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.titleBlock}>
            <Text style={[styles.appName, { color: colors.foreground }]}>
              Doğruluk Dedektifi
            </Text>
            <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
              Dezenformasyona karşı silahlan.{"\n"}Misyonunu seç, gerçeği bul.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(420).springify()} style={styles.authButtons}>
            <Text style={[styles.authLabel, { color: colors.mutedForeground }]}>
              Nasıl devam etmek istersin?
            </Text>
            {providerMap.map((p, i) => (
              <Animated.View key={p.id} entering={FadeInDown.delay(480 + i * 70).springify()}>
                <TouchableOpacity
                  style={[
                    styles.authBtn,
                    {
                      backgroundColor: colors.card,
                      borderColor: p.color + "44",
                      opacity: loading ? 0.6 : 1,
                    },
                  ]}
                  onPress={() => handleProviderSelect(p.id)}
                  disabled={loading}
                  activeOpacity={0.78}
                >
                  <View style={[styles.authBtnIcon, { backgroundColor: p.color + "18" }]}>
                    {loading && selectedProvider === p.id ? (
                      <ActivityIndicator size="small" color={p.color} />
                    ) : (
                      <Feather name={p.icon as any} size={18} color={p.color} />
                    )}
                  </View>
                  <Text style={[styles.authBtnText, { color: colors.foreground }]}>
                    {p.label}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>

          <ErrorBox error={error} />

          <TouchableOpacity
            style={[
              styles.authBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: loading ? 0.6 : 1,
              },
            ]}
            onPress={handleAnonymousSignIn}
            disabled={loading}
            activeOpacity={0.78}
          >
            <View style={[styles.authBtnIcon, { backgroundColor: colors.mutedForeground + "18" }]}>
              {loading && selectedProvider === null ? (
                <ActivityIndicator size="small" color={colors.mutedForeground} />
              ) : (
                <Feather name="user" size={18} color={colors.mutedForeground} />
              )}
            </View>
            <Text style={[styles.authBtnText, { color: colors.mutedForeground }]}>
              Misafir olarak devam et
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <Animated.View entering={FadeInDown.delay(760).springify()}>
            <Text style={[styles.legal, { color: colors.mutedForeground }]}>
              Devam ederek{" "}
              <Text style={{ color: colors.primary }}>Gizlilik Politikası</Text> ve{" "}
              <Text style={{ color: colors.primary }}>Kullanım Koşulları</Text>'nı kabul etmiş olursun.
            </Text>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}
