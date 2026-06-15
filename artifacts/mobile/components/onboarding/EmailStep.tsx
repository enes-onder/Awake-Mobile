import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
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
import { BackButton } from "./BackButton";
import { ErrorBox } from "./ErrorBox";
import { OnboardingLogo } from "./OnboardingLogo";
import { styles } from "./styles";

interface EmailStepProps {
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
  emailMode: "password" | "magic";
  setEmailMode: (v: "password" | "magic") => void;
  clearError: () => void;
  handleEmailAuth: () => void;
  onBack: () => void;
}

export function EmailStep({
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
  emailMode,
  setEmailMode,
  clearError,
  handleEmailAuth,
  onBack,
}: EmailStepProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={Keyboard.dismiss}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View entering={FadeInUp.springify()} style={styles.formStep}>
          <BackButton onPress={onBack} />

          <OnboardingLogo delay={80} />

          <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.titleBlock}>
            <Text style={[styles.appName, { color: colors.foreground }]}>
              E-posta ile Giriş
            </Text>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(160).springify()}
            style={[styles.modeTabs, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <TouchableOpacity
              style={[styles.modeTab, emailMode === "password" && { backgroundColor: colors.primary }]}
              onPress={() => { setEmailMode("password"); clearError(); }}
            >
              <Feather
                name="lock"
                size={13}
                color={emailMode === "password" ? "#fff" : colors.mutedForeground}
              />
              <Text style={[styles.modeTabText, { color: emailMode === "password" ? "#fff" : colors.mutedForeground }]}>
                Şifre ile
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, emailMode === "magic" && { backgroundColor: colors.primary }]}
              onPress={() => { setEmailMode("magic"); clearError(); }}
            >
              <Feather
                name="send"
                size={13}
                color={emailMode === "magic" ? "#fff" : colors.mutedForeground}
              />
              <Text style={[styles.modeTabText, { color: emailMode === "magic" ? "#fff" : colors.mutedForeground }]}>
                Bağlantı gönder
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {emailMode === "magic" && (
            <Animated.View entering={FadeInDown.delay(10).springify()}>
              <View style={[styles.infoBox, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "33" }]}>
                <Feather name="info" size={13} color={colors.primary} />
                <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
                  E-postana tek kullanımlık giriş bağlantısı gönderilir. Şifre gerekmez.
                </Text>
              </View>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formFields}>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Feather name="mail" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                placeholder="E-posta adresi"
                placeholderTextColor={colors.mutedForeground}
                value={emailInput}
                onChangeText={setEmailInput}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={emailMode === "magic" ? handleEmailAuth : undefined}
                returnKeyType={emailMode === "magic" ? "send" : "next"}
              />
            </View>

            {emailMode === "password" && (
              <>
                <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
                  <Feather name="lock" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.fieldInput, { color: colors.foreground }]}
                    placeholder="Şifre (en az 6 karakter)"
                    placeholderTextColor={colors.mutedForeground}
                    value={passwordInput}
                    onChangeText={setPasswordInput}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleEmailAuth}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={toggleShowPassword}>
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => { toggleSignUp(); clearError(); }}>
                  <Text style={[styles.toggleText, { color: colors.mutedForeground }]}>
                    {isSignUp ? "Zaten hesabın var mı? " : "Hesabın yok mu? "}
                    <Text style={{ color: colors.primary }}>
                      {isSignUp ? "Giriş yap" : "Kayıt ol"}
                    </Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>

          <ErrorBox error={error} />

          <Animated.View entering={FadeInDown.delay(280).springify()} style={{ width: "100%" }}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : emailMode === "magic" ? (
                <>
                  <Feather name="send" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Bağlantı Gönder</Text>
                </>
              ) : (
                <>
                  <Feather name={isSignUp ? "user-plus" : "log-in"} size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>{isSignUp ? "Kayıt Ol" : "Giriş Yap"}</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}
