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

interface PhoneStepProps {
  loading: boolean;
  error: string | null;
  phoneInput: string;
  setPhoneInput: (v: string) => void;
  handleSendOTP: () => void;
  onBack: () => void;
}

export function PhoneStep({
  loading,
  error,
  phoneInput,
  setPhoneInput,
  handleSendOTP,
  onBack,
}: PhoneStepProps) {
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
              Telefon ile Giriş
            </Text>
            <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
              Türkiye numaraları için ülke kodu{"\n"}otomatik eklenir (+90)
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formFields}>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <View style={[styles.countryCode, { borderRightColor: colors.border }]}>
                <Text style={[styles.countryCodeText, { color: colors.mutedForeground }]}>🇹🇷 +90</Text>
              </View>
              <TextInput
                style={[styles.fieldInput, { color: colors.foreground }]}
                placeholder="5XX XXX XX XX"
                placeholderTextColor={colors.mutedForeground}
                value={phoneInput}
                onChangeText={setPhoneInput}
                keyboardType="phone-pad"
                maxLength={13}
                onSubmitEditing={handleSendOTP}
                returnKeyType="done"
              />
            </View>
          </Animated.View>

          <ErrorBox error={error} />

          <Animated.View entering={FadeInDown.delay(280).springify()} style={{ width: "100%" }}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.success, opacity: loading ? 0.7 : 1 }]}
              onPress={handleSendOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="message-circle" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>SMS Kodu Gönder</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}
