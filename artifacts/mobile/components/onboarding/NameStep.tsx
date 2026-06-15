import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Keyboard,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import type { AuthProvider, ProviderItem } from "./types";
import { OnboardingLogo } from "./OnboardingLogo";
import { styles } from "./styles";

interface NameStepProps {
  nameInput: string;
  setNameInput: (v: string) => void;
  nameInputRef: React.RefObject<TextInput>;
  canStart: boolean;
  handleStart: () => void;
  selectedProvider: AuthProvider | null;
  providerMap: ProviderItem[];
  onBack: () => void;
}

const FEATURES = [
  { icon: "zap", text: "XP Kazan" },
  { icon: "trending-up", text: "Seri Kur" },
  { icon: "award", text: "Rozet Al" },
] as const;

export function NameStep({
  nameInput,
  setNameInput,
  nameInputRef,
  canStart,
  handleStart,
  selectedProvider,
  providerMap,
  onBack,
}: NameStepProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const provider = providerMap.find((p) => p.id === selectedProvider);

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={Keyboard.dismiss}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View entering={FadeInUp.springify()} style={styles.nameStep}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card }]}
            onPress={onBack}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>

          <OnboardingLogo delay={100} />

          {provider && (
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              style={[styles.providerBadge, { backgroundColor: provider.color + "18", borderColor: provider.color + "44" }]}
            >
              <Feather name={provider.icon as any} size={14} color={provider.color} />
              <Text style={[styles.providerBadgeText, { color: provider.color }]}>
                {provider.label
                  .replace("ile Giriş Yap", "")
                  .replace("ile Kayıt Ol", "")
                  .replace("ile Devam Et", "")
                  .trim()}
              </Text>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(220).springify()} style={styles.titleBlock}>
            <Text style={[styles.appName, { color: colors.foreground }]}>
              Kod adını seç, Ajan
            </Text>
            <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
              Bu isim misyonlarında seni temsil edecek.{"\n"}Değiştirmek istersen profilinden yapabilirsin.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.nameInputArea}>
            <TextInput
              ref={nameInputRef}
              style={[
                styles.nameInput,
                {
                  color: colors.foreground,
                  borderColor: canStart ? colors.primary : colors.border,
                  backgroundColor: colors.card,
                },
              ]}
              placeholder="Örn: GizliAjan42"
              placeholderTextColor={colors.mutedForeground}
              value={nameInput}
              onChangeText={setNameInput}
              maxLength={18}
              autoCorrect={false}
              onSubmitEditing={canStart ? handleStart : undefined}
              returnKeyType="go"
            />
            {nameInput.length > 0 && (
              <Text style={[styles.charCount, { color: colors.mutedForeground }]}>
                {nameInput.length}/18
              </Text>
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify()} style={{ width: "100%" }}>
            <TouchableOpacity
              style={[
                styles.startBtn,
                {
                  backgroundColor: canStart ? colors.primary : colors.card,
                  opacity: canStart ? 1 : 0.6,
                },
              ]}
              onPress={handleStart}
              disabled={!canStart}
              activeOpacity={0.85}
            >
              <Feather name="shield" size={20} color="#fff" />
              <Text style={styles.startBtnText}>Göreve Başla</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(480).springify()}>
            <View style={styles.featureRow}>
              {FEATURES.map((f) => (
                <View key={f.text} style={[styles.featureTag, { backgroundColor: colors.card }]}>
                  <Feather name={f.icon as any} size={13} color={colors.warning} />
                  <Text style={[styles.featureTagText, { color: colors.mutedForeground }]}>
                    {f.text}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}
