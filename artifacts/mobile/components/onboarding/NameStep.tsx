import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
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

const WHY_ITEMS = [
  { icon: "shield", color: "#3B82F6", title: "Gerçek Beceri Öğren", desc: "Tersine görsel arama, metadata analizi — hayatta kullanacağın teknikler" },
  { icon: "trending-up", color: "#00C851", title: "Her Gün İlerle", desc: "Seri sistemi ile her gün oynayarak rütbe kazan, sertifika al" },
  { icon: "zap", color: "#FF9500", title: "Haber Kandırmacasına Dur De", desc: "Akıllı olduğunu kanıtla — sahte haberler seni artık kandıramaz" },
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
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 24,
          maxWidth: 430,
          alignSelf: "center",
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          onPress={onBack}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>

        <Animated.View entering={FadeInUp.springify()} style={{ alignItems: "center", marginTop: 44, marginBottom: 20 }}>
          <OnboardingLogo delay={100} />
        </Animated.View>

        {provider && (
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            style={[styles.providerBadge, { backgroundColor: provider.color + "18", borderColor: provider.color + "44", alignSelf: "center", marginBottom: 16 }]}
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

        <Animated.View entering={FadeInDown.delay(200).springify()} style={[styles.titleBlock, { marginBottom: 20 }]}>
          <Text style={[styles.appName, { color: colors.foreground }]}>
            Kod adını seç, Ajan
          </Text>
          <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
            Bu isim misyonlarında seni temsil edecek.{"\n"}Değiştirmek istersen profilinden yapabilirsin.
          </Text>
        </Animated.View>

        {/* Why cards */}
        <Animated.View entering={FadeInDown.delay(270).springify()} style={nameStepStyles.whySection}>
          {WHY_ITEMS.map((item, i) => (
            <View key={item.title} style={[nameStepStyles.whyCard, { backgroundColor: colors.card, borderColor: item.color + "33" }]}>
              <View style={[nameStepStyles.whyIcon, { backgroundColor: item.color + "18" }]}>
                <Feather name={item.icon as any} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[nameStepStyles.whyTitle, { color: colors.foreground }]}>{item.title}</Text>
                <Text style={[nameStepStyles.whyDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
              </View>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(380).springify()} style={[styles.nameInputArea, { marginTop: 20 }]}>
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

        <Animated.View entering={FadeInDown.delay(440).springify()} style={{ width: "100%", marginTop: 14 }}>
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

        <Animated.View entering={FadeInDown.delay(500).springify()} style={{ marginTop: 16 }}>
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
      </ScrollView>
    </Pressable>
  );
}

const nameStepStyles = StyleSheet.create({
  whySection: { gap: 8 },
  whyCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 13,
  },
  whyIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  whyTitle: { fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 2 },
  whyDesc: { fontFamily: "Inter_400Regular", fontSize: 12, lineHeight: 17 },
});
