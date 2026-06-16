import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { OnboardingLogo } from "./OnboardingLogo";
import { styles as shared } from "./styles";

interface NameStepProps {
  nameInput: string;
  setNameInput: (v: string) => void;
  nameInputRef: React.RefObject<TextInput | null>;
  canStart: boolean;
  handleStart: () => void;
  onBack: () => void;
}

const FEATURES = [
  { icon: "zap",         text: "XP Kazan" },
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
      style={[shared.container, { backgroundColor: colors.background }]}
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
        {/* Back */}
        <TouchableOpacity
          style={[shared.backBtn, { backgroundColor: colors.card }]}
          onPress={onBack}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>

        {/* Logo */}
        <Animated.View
          entering={FadeInUp.springify()}
          style={{ alignItems: "center", marginTop: 44, marginBottom: 20 }}
        >
          <OnboardingLogo delay={80} />
        </Animated.View>

        {/* Title */}
        <Animated.View
          entering={FadeInDown.delay(150).springify()}
          style={[shared.titleBlock, { marginBottom: 28 }]}
        >
          <Text style={[shared.appName, { color: colors.foreground }]}>
            Kod adını seç, Ajan
          </Text>
          <Text style={[shared.appTagline, { color: colors.mutedForeground }]}>
            Bu isim misyonlarında seni temsil edecek.{"\n"}Dilediğin zaman profilinden değiştirebilirsin.
          </Text>
        </Animated.View>

        {/* Name input */}
        <Animated.View
          entering={FadeInDown.delay(220).springify()}
          style={shared.nameInputArea}
        >
          <TextInput
            ref={nameInputRef}
            style={[
              shared.nameInput,
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
            <Text style={[shared.charCount, { color: colors.mutedForeground }]}>
              {nameInput.length}/18
            </Text>
          )}
        </Animated.View>

        {/* Start button */}
        <Animated.View
          entering={FadeInDown.delay(290).springify()}
          style={{ width: "100%", marginTop: 16 }}
        >
          <TouchableOpacity
            style={[
              shared.startBtn,
              {
                backgroundColor: canStart ? colors.primary : colors.card,
                opacity: canStart ? 1 : 0.45,
              },
            ]}
            onPress={handleStart}
            disabled={!canStart}
            activeOpacity={0.85}
          >
            <Feather name="shield" size={20} color="#fff" />
            <Text style={shared.startBtnText}>Göreve Başla</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Feature tags */}
        <Animated.View
          entering={FadeInDown.delay(360).springify()}
          style={{ marginTop: 20 }}
        >
          <View style={shared.featureRow}>
            {FEATURES.map((f) => (
              <View
                key={f.text}
                style={[shared.featureTag, { backgroundColor: colors.card }]}
              >
                <Feather name={f.icon as any} size={13} color={colors.warning} />
                <Text style={[shared.featureTagText, { color: colors.mutedForeground }]}>
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
