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

interface OtpStepProps {
  loading: boolean;
  error: string | null;
  phoneInput: string;
  otpInput: string;
  setOtpInput: (v: string) => void;
  handleVerifyOTP: () => void;
  handleSendOTP: () => void;
  onBack: () => void;
}

export function OtpStep({
  loading,
  error,
  phoneInput,
  otpInput,
  setOtpInput,
  handleVerifyOTP,
  handleSendOTP,
  onBack,
}: OtpStepProps) {
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
              Kodu Gir
            </Text>
            <Text style={[styles.appTagline, { color: colors.mutedForeground }]}>
              {phoneInput} numarasına gönderilen{"\n"}6 haneli kodu gir
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.formFields}>
            <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Feather name="key" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.fieldInput, styles.otpInput, { color: colors.foreground }]}
                placeholder="• • • • • •"
                placeholderTextColor={colors.mutedForeground}
                value={otpInput}
                onChangeText={setOtpInput}
                keyboardType="number-pad"
                maxLength={6}
                onSubmitEditing={handleVerifyOTP}
                returnKeyType="done"
                autoFocus
              />
            </View>
          </Animated.View>

          <ErrorBox error={error} />

          <Animated.View entering={FadeInDown.delay(280).springify()} style={{ width: "100%" }}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.success, opacity: loading ? 0.7 : 1 }]}
              onPress={handleVerifyOTP}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="check-circle" size={18} color="#fff" />
                  <Text style={styles.primaryBtnText}>Doğrula</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(340).springify()}>
            <TouchableOpacity onPress={handleSendOTP}>
              <Text style={[styles.toggleText, { color: colors.mutedForeground }]}>
                Kod gelmedi mi?{" "}
                <Text style={{ color: colors.primary }}>Tekrar gönder</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Pressable>
  );
}
