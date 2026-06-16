import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
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
import { ErrorBox } from "./ErrorBox";
import { styles as shared } from "./styles";

interface AuthScreenProps {
  loading: boolean;
  error: string | null;
  emailInput: string;
  setEmailInput: (v: string) => void;
  passwordInput: string;
  setPasswordInput: (v: string) => void;
  isSignUp: boolean;
  toggleSignUp: () => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  clearError: () => void;
  handleEmailAuth: () => void;
  handleAnonymousSignIn: () => void;
  onBack: () => void;
}

export function AuthScreen({
  loading,
  error,
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  isSignUp,
  toggleSignUp,
  showPassword,
  toggleShowPassword,
  clearError,
  handleEmailAuth,
  handleAnonymousSignIn,
  onBack,
}: AuthScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Math.max(insets.bottom, 16);

  const canSubmit = emailInput.trim().length > 4 && passwordInput.length >= 6;

  return (
    <Pressable
      style={[shared.container, { backgroundColor: colors.background }]}
      onPress={Keyboard.dismiss}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: botPad + 20,
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

        {/* Register / Login tabs */}
        <Animated.View
          entering={FadeInDown.delay(140).springify()}
          style={[
            authStyles.tabs,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[
              authStyles.tab,
              !isSignUp && { backgroundColor: colors.primary },
            ]}
            onPress={() => { if (isSignUp) { toggleSignUp(); clearError(); } }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                authStyles.tabText,
                { color: !isSignUp ? "#fff" : colors.mutedForeground },
              ]}
            >
              Giriş Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              authStyles.tab,
              isSignUp && { backgroundColor: colors.primary },
            ]}
            onPress={() => { if (!isSignUp) { toggleSignUp(); clearError(); } }}
            activeOpacity={0.8}
          >
            <Text
              style={[
                authStyles.tabText,
                { color: isSignUp ? "#fff" : colors.mutedForeground },
              ]}
            >
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Form fields */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={authStyles.form}
        >
          <View
            style={[
              authStyles.field,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[authStyles.fieldInput, { color: colors.foreground }]}
              placeholder="E-posta adresi"
              placeholderTextColor={colors.mutedForeground}
              value={emailInput}
              onChangeText={setEmailInput}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View
            style={[
              authStyles.field,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Feather name="lock" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[authStyles.fieldInput, { color: colors.foreground }]}
              placeholder={isSignUp ? "Şifre oluştur (min. 6 karakter)" : "Şifre"}
              placeholderTextColor={colors.mutedForeground}
              value={passwordInput}
              onChangeText={setPasswordInput}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={canSubmit ? handleEmailAuth : undefined}
            />
            <TouchableOpacity onPress={toggleShowPassword} hitSlop={8}>
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        <ErrorBox error={error} />

        {/* Primary CTA */}
        <Animated.View entering={FadeInDown.delay(260).springify()} style={{ marginTop: 14 }}>
          <TouchableOpacity
            style={[
              authStyles.primaryBtn,
              {
                backgroundColor: canSubmit ? colors.primary : colors.card,
                opacity: loading ? 0.7 : canSubmit ? 1 : 0.45,
              },
            ]}
            onPress={handleEmailAuth}
            disabled={loading || !canSubmit}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather
                  name={isSignUp ? "user-plus" : "log-in"}
                  size={18}
                  color="#fff"
                />
                <Text style={authStyles.primaryBtnText}>
                  {isSignUp ? "Kayıt Ol" : "Giriş Yap"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Divider */}
        <Animated.View
          entering={FadeInDown.delay(310).springify()}
          style={authStyles.divider}
        >
          <View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[authStyles.dividerText, { color: colors.mutedForeground }]}>
            veya
          </Text>
          <View style={[authStyles.dividerLine, { backgroundColor: colors.border }]} />
        </Animated.View>

        {/* Google — Yakında */}
        <Animated.View entering={FadeInDown.delay(350).springify()}>
          <ComingSoonButton
            label="Google ile Devam Et"
            icon="globe"
            accentColor="#EA4335"
            colors={colors}
          />
        </Animated.View>

        {/* Apple — Yakında */}
        <Animated.View entering={FadeInDown.delay(390).springify()} style={{ marginTop: 10 }}>
          <ComingSoonButton
            label="Apple ile Devam Et"
            icon="smartphone"
            accentColor="#AAAAAA"
            colors={colors}
          />
        </Animated.View>

        {/* Anonymous link — small, at bottom */}
        <Animated.View
          entering={FadeInDown.delay(450).springify()}
          style={authStyles.anonRow}
        >
          <TouchableOpacity
            onPress={handleAnonymousSignIn}
            activeOpacity={0.7}
            style={authStyles.anonBtn}
          >
            <Text style={[authStyles.anonText, { color: colors.mutedForeground }]}>
              Hesap oluşturmadan devam et
            </Text>
            <Feather name="chevron-right" size={13} color={colors.mutedForeground} />
          </TouchableOpacity>
          <Text style={[authStyles.anonNote, { color: colors.mutedForeground }]}>
            İlerleme kaydedilmez
          </Text>
        </Animated.View>
      </ScrollView>
    </Pressable>
  );
}

interface ComingSoonButtonProps {
  label: string;
  icon: string;
  accentColor: string;
  colors: ReturnType<typeof import("@/hooks/useColors").useColors>;
}

function ComingSoonButton({ label, icon, accentColor, colors }: ComingSoonButtonProps) {
  return (
    <View
      style={[
        authStyles.socialBtn,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: 0.5,
        },
      ]}
    >
      <View style={[authStyles.socialIcon, { backgroundColor: accentColor + "18" }]}>
        <Feather name={icon as any} size={18} color={accentColor} />
      </View>
      <Text style={[authStyles.socialLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={[authStyles.soonBadge, { backgroundColor: colors.warning + "1E" }]}>
        <Text style={[authStyles.soonText, { color: colors.warning }]}>Yakında</Text>
      </View>
    </View>
  );
}

const authStyles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
  },
  form: {
    gap: 12,
  },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  fieldInput: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 15,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    borderRadius: 16,
    width: "100%",
  },
  primaryBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 18,
  },
  dividerLine: { flex: 1, height: 1 },
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
    borderRadius: 14,
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
  anonRow: {
    alignItems: "center",
    gap: 4,
    marginTop: 28,
  },
  anonBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  anonText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
  },
  anonNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    opacity: 0.6,
  },
});
