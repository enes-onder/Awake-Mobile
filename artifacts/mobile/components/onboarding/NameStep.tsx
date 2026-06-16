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
import { OnboardingLogo } from "./OnboardingLogo";
import { styles as sharedStyles } from "./styles";

interface NameStepProps {
  nameInput: string;
  setNameInput: (v: string) => void;
  nameInputRef: React.RefObject<TextInput | null>;
  canStart: boolean;
  handleStart: () => void;
  onBack: () => void;
}

const FEATURES = [
  { icon: "zap",        text: "XP Kazan" },
  { icon: "trending-up", text: "Seri Kur" },
  { icon: "award",       text: "Rozet Al" },
] as const;

export function NameStep({
  nameInput,
  setNameInput,
  nameInputRef,
  canStart,
  handleStart,
  onBack,
}: NameStepProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={[sharedStyles.container, { backgroundColor: colors.background }]}
      onPress={Keyboard.dismiss}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 28,
          paddingHorizontal: 24,
          maxWidth: 430,
          alignSelf: "center",
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity
          style={[sharedStyles.backBtn, { backgroundColor: colors.card }]}
          onPress={onBack}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>

        {/* Logo */}
        <Animated.View
          entering={FadeInUp.springify()}
          style={{ alignItems: "center", marginTop: 44, marginBottom: 16 }}
        >
          <OnboardingLogo delay={80} />
        </Animated.View>

        {/* Title */}
        <Animated.View
          entering={FadeInDown.delay(160).springify()}
          style={[sharedStyles.titleBlock, { marginBottom: 24 }]}
        >
          <Text style={[sharedStyles.appName, { color: colors.foreground }]}>
            Kod adını seç, Ajan
          </Text>
          <Text style={[sharedStyles.appTagline, { color: colors.mutedForeground }]}>
            Bu isim misyonlarında seni temsil edecek.{"\n"}Değiştirmek istersen profilinden yapabilirsin.
          </Text>
        </Animated.View>

        {/* Name input */}
        <Animated.View
          entering={FadeInDown.delay(240).springify()}
          style={[sharedStyles.nameInputArea]}
        >
          <TextInput
            ref={nameInputRef}
            style={[
              sharedStyles.nameInput,
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
            <Text style={[sharedStyles.charCount, { color: colors.mutedForeground }]}>
              {nameInput.length}/18
            </Text>
          )}
        </Animated.View>

        {/* Anonymous start */}
        <Animated.View
          entering={FadeInDown.delay(300).springify()}
          style={{ width: "100%", marginTop: 14 }}
        >
          <TouchableOpacity
            style={[
              sharedStyles.startBtn,
              {
                backgroundColor: canStart ? colors.primary : colors.card,
                opacity: canStart ? 1 : 0.55,
              },
            ]}
            onPress={handleStart}
            disabled={!canStart}
            activeOpacity={0.85}
          >
            <Feather name="shield" size={20} color="#fff" />
            <Text style={sharedStyles.startBtnText}>Hızlı Giriş</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <Animated.View
          entering={FadeInDown.delay(360).springify()}
          style={nameStepStyles.dividerRow}
        >
          <View style={[nameStepStyles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[nameStepStyles.dividerText, { color: colors.mutedForeground }]}>
            veya
          </Text>
          <View style={[nameStepStyles.dividerLine, { backgroundColor: colors.border }]} />
        </Animated.View>

        {/* Google mock button */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <MockSocialButton
            label="Google ile Giriş Yap"
            icon="globe"
            accentColor="#EA4335"
            colors={colors}
          />
        </Animated.View>

        {/* Apple mock button */}
        <Animated.View entering={FadeInDown.delay(450).springify()} style={{ marginTop: 10 }}>
          <MockSocialButton
            label="Apple ile Giriş Yap"
            icon="smartphone"
            accentColor="#AAAAAA"
            colors={colors}
          />
        </Animated.View>

        {/* Feature tags */}
        <Animated.View
          entering={FadeInDown.delay(520).springify()}
          style={{ marginTop: 20 }}
        >
          <View style={sharedStyles.featureRow}>
            {FEATURES.map((f) => (
              <View
                key={f.text}
                style={[sharedStyles.featureTag, { backgroundColor: colors.card }]}
              >
                <Feather name={f.icon as any} size={13} color={colors.warning} />
                <Text style={[sharedStyles.featureTagText, { color: colors.mutedForeground }]}>
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

interface MockSocialButtonProps {
  label: string;
  icon: string;
  accentColor: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}

function MockSocialButton({ label, icon, accentColor, colors }: MockSocialButtonProps) {
  return (
    <TouchableOpacity
      style={[
        nameStepStyles.socialBtn,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: 0.55,
        },
      ]}
      activeOpacity={0.7}
      disabled
    >
      <View style={[nameStepStyles.socialIcon, { backgroundColor: accentColor + "18" }]}>
        <Feather name={icon as any} size={18} color={accentColor} />
      </View>
      <Text style={[nameStepStyles.socialLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <View style={[nameStepStyles.soonBadge, { backgroundColor: colors.warning + "22" }]}>
        <Text style={[nameStepStyles.soonText, { color: colors.warning }]}>Yakında</Text>
      </View>
    </TouchableOpacity>
  );
}

const nameStepStyles = StyleSheet.create({
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  socialIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  socialLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    flex: 1,
  },
  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  soonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
  },
});
