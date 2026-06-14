import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";
import { supabase } from "@/lib/supabase";

WebBrowser.maybeCompleteAuthSession();

type Step = "auth" | "email" | "phone" | "otp" | "name";
type AuthProvider = "google" | "apple" | "email" | "phone";

function GlowRing({ color }: { color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(withSpring(1.15, { damping: 4 }), withSpring(1, { damping: 6 })),
      -1,
      true
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.25, { duration: 1200 }),
        withTiming(0.6, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        ringStyle,
        {
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: 60,
          borderWidth: 2,
          borderColor: color,
        },
      ]}
    />
  );
}

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const _rScale = Math.min(Math.max(width / 390, 0.9), 1.2);
  const rfs = (base: number) => Math.round(base * _rScale);
  const { setUsername, signInAnonymously, authUser, username } = useUser();

  const [step, setStep] = useState<Step>("auth");
  const [selectedProvider, setSelectedProvider] = useState<AuthProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // When auth completes (any method) and user has no username yet → go to name step
  React.useEffect(() => {
    if (authUser && !username && (step === "auth" || step === "email" || step === "phone")) {
      setStep("name");
    }
  }, [authUser]);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailMode, setEmailMode] = useState<"password" | "magic">("password");

  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  const [nameInput, setNameInput] = useState("");
  const nameInputRef = useRef<TextInput>(null);

  const providerMap: { id: AuthProvider; label: string; icon: string; color: string }[] = [
    { id: "google", label: "Google ile Giriş Yap", icon: "globe", color: "#EA4335" },
    { id: "apple", label: "Apple ile Giriş Yap", icon: "smartphone", color: "#FFFFFF" },
    { id: "email", label: "E-posta ile Kayıt Ol", icon: "mail", color: colors.primary },
    { id: "phone", label: "Telefon ile Devam Et", icon: "phone", color: colors.success },
  ];

  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    setLoading(true);
    clearError();
    try {
      if (Platform.OS === "web") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.origin },
        });
        if (error) setError(error.message);
      } else {
        const redirectTo = Linking.createURL("/");
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) { setError(error.message); return; }
        if (data.url) {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (result.type === "success") {
            await supabase.auth.exchangeCodeForSession(result.url);
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  const signInWithApple = async () => {
    setLoading(true);
    clearError();
    try {
      if (Platform.OS === "web") {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "apple",
          options: { redirectTo: window.location.origin },
        });
        if (error) setError(error.message);
      } else {
        const redirectTo = Linking.createURL("/");
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "apple",
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error) { setError(error.message); return; }
        if (data.url) {
          const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
          if (result.type === "success") {
            await supabase.auth.exchangeCodeForSession(result.url);
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Apple girişi başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    const email = emailInput.trim();
    if (!email) { setError("E-posta adresi gerekli"); return; }

    setLoading(true);
    clearError();
    try {
      if (emailMode === "magic") {
        const redirectTo = Platform.OS === "web"
          ? window.location.origin
          : Linking.createURL("/");
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: redirectTo },
        });
        if (error) setError(error.message);
        else setError("✅ Bağlantı gönderildi! E-postanı kontrol et ve linke tıkla.");
      } else {
        const password = passwordInput;
        if (!password) { setError("Şifre gerekli"); setLoading(false); return; }
        if (password.length < 6) { setError("Şifre en az 6 karakter olmalı"); setLoading(false); return; }

        if (isSignUp) {
          const { error } = await supabase.auth.signUp({ email, password });
          if (error) setError(error.message);
          else setError("✅ Doğrulama e-postası gönderildi. Gelen kutunu kontrol et.");
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) {
            setError(error.message);
          } else {
            // For new users (no username yet), go to name step.
            // NavController handles redirect for returning users who have a username stored.
            setStep("name");
          }
        }
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Giriş başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    const rawPhone = phoneInput.trim().replace(/\s/g, "");
    const phone = rawPhone.startsWith("+") ? rawPhone : `+90${rawPhone}`;
    if (phone.length < 10) { setError("Geçerli bir telefon numarası gir"); return; }

    setLoading(true);
    clearError();
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone });
      if (error) setError(error.message);
      else setStep("otp");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "SMS gönderilemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const rawPhone = phoneInput.trim().replace(/\s/g, "");
    const phone = rawPhone.startsWith("+") ? rawPhone : `+90${rawPhone}`;
    const token = otpInput.trim();
    if (token.length !== 6) { setError("6 haneli kodu gir"); return; }

    setLoading(true);
    clearError();
    try {
      const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
      if (error) setError(error.message);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Doğrulama başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleProviderSelect = (id: AuthProvider) => {
    setSelectedProvider(id);
    clearError();
    if (id === "google") { signInWithGoogle(); return; }
    if (id === "apple") { signInWithApple(); return; }
    if (id === "email") { setIsSignUp(true); setStep("email"); return; }
    if (id === "phone") { setStep("phone"); return; }
  };

  const handleAnonymousSignIn = async () => {
    setLoading(true);
    clearError();
    const { error: errMsg } = await signInAnonymously();
    setLoading(false);
    if (errMsg) {
      setError("Hata: " + errMsg);
    } else {
      setStep("name");
    }
  };

  const handleStart = () => {
    const name = nameInput.trim();
    if (!name) return;
    setUsername(name);
    router.replace("/(tabs)");
  };

  const canStart = nameInput.trim().length >= 2;
  const provider = providerMap.find((p) => p.id === selectedProvider);

  const renderLogo = (delay = 100) => (
    <View style={styles.logoArea}>
      <GlowRing color={colors.primary} />
      <Animated.View
        entering={FadeInDown.delay(delay).springify()}
        style={[styles.logoCircle, { backgroundColor: colors.primary + "22" }]}
      >
        <Feather name="shield" size={52} color={colors.primary} />
      </Animated.View>
    </View>
  );

  const renderError = () =>
    error ? (
      <View
        style={[
          styles.errorBox,
          {
            backgroundColor: error.startsWith("✅") ? colors.success + "18" : colors.fake + "18",
            borderColor: error.startsWith("✅") ? colors.success + "44" : colors.fake + "44",
          },
        ]}
      >
        <Text
          style={[
            styles.errorText,
            { color: error.startsWith("✅") ? colors.success : colors.fake },
          ]}
        >
          {error}
        </Text>
      </View>
    ) : null;

  const renderBackBtn = (onPress: () => void) => (
    <TouchableOpacity
      style={[styles.backBtn, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <Feather name="arrow-left" size={18} color={colors.foreground} />
    </TouchableOpacity>
  );

  if (step === "auth") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
          <Animated.View entering={FadeInUp.springify()} style={styles.authStep}>
            {renderLogo(200)}

            <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.titleBlock}>
              <Text style={[styles.appName, { color: colors.foreground, fontSize: rfs(26) }]}>
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

            {renderError()}

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

  if (step === "email") {
    return (
      <Pressable
        style={[styles.container, { backgroundColor: colors.background }]}
        onPress={Keyboard.dismiss}
      >
        <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
          <Animated.View entering={FadeInUp.springify()} style={styles.formStep}>
            {renderBackBtn(() => { setStep("auth"); clearError(); })}

            {renderLogo(80)}

            <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.titleBlock}>
              <Text style={[styles.appName, { color: colors.foreground, fontSize: rfs(26) }]}>
                E-posta ile Giriş
              </Text>
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(160).springify()}
              style={[styles.modeTabs, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  emailMode === "password" && { backgroundColor: colors.primary },
                ]}
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
                style={[
                  styles.modeTab,
                  emailMode === "magic" && { backgroundColor: colors.primary },
                ]}
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
                    <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                      <Feather
                        name={showPassword ? "eye-off" : "eye"}
                        size={16}
                        color={colors.mutedForeground}
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity onPress={() => { setIsSignUp((v) => !v); clearError(); }}>
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

            {renderError()}

            <Animated.View entering={FadeInDown.delay(280).springify()} style={{ width: "100%" }}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
                ]}
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
                    <Text style={styles.primaryBtnText}>
                      {isSignUp ? "Kayıt Ol" : "Giriş Yap"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </View>
      </Pressable>
    );
  }

  if (step === "phone") {
    return (
      <Pressable
        style={[styles.container, { backgroundColor: colors.background }]}
        onPress={Keyboard.dismiss}
      >
        <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
          <Animated.View entering={FadeInUp.springify()} style={styles.formStep}>
            {renderBackBtn(() => { setStep("auth"); clearError(); })}

            {renderLogo(80)}

            <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.titleBlock}>
              <Text style={[styles.appName, { color: colors.foreground, fontSize: rfs(26) }]}>
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

            {renderError()}

            <Animated.View entering={FadeInDown.delay(280).springify()} style={{ width: "100%" }}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: colors.success, opacity: loading ? 0.7 : 1 },
                ]}
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

  if (step === "otp") {
    return (
      <Pressable
        style={[styles.container, { backgroundColor: colors.background }]}
        onPress={Keyboard.dismiss}
      >
        <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
          <Animated.View entering={FadeInUp.springify()} style={styles.formStep}>
            {renderBackBtn(() => { setStep("phone"); clearError(); })}

            {renderLogo(80)}

            <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.titleBlock}>
              <Text style={[styles.appName, { color: colors.foreground, fontSize: rfs(26) }]}>
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

            {renderError()}

            <Animated.View entering={FadeInDown.delay(280).springify()} style={{ width: "100%" }}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: colors.success, opacity: loading ? 0.7 : 1 },
                ]}
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
              <TouchableOpacity onPress={() => { handleSendOTP(); }}>
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

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.background }]}
      onPress={Keyboard.dismiss}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View entering={FadeInUp.springify()} style={styles.nameStep}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.card }]}
            onPress={() => setStep("auth")}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>

          {renderLogo(100)}

          {provider && (
            <Animated.View
              entering={FadeInDown.delay(150).springify()}
              style={[styles.providerBadge, { backgroundColor: provider.color + "18", borderColor: provider.color + "44" }]}
            >
              <Feather name={provider.icon as any} size={14} color={provider.color} />
              <Text style={[styles.providerBadgeText, { color: provider.color }]}>
                {provider.label.replace("ile Giriş Yap", "").replace("ile Kayıt Ol", "").replace("ile Devam Et", "").trim()}
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
              {[
                { icon: "zap", text: "XP Kazan" },
                { icon: "trending-up", text: "Seri Kur" },
                { icon: "award", text: "Rozet Al" },
              ].map((f) => (
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

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center" },
  inner: { flex: 1, paddingHorizontal: 24, width: "100%", maxWidth: 430 },
  authStep: { flex: 1, justifyContent: "center", gap: 14 },
  nameStep: { flex: 1, justifyContent: "center", gap: 24 },
  formStep: { flex: 1, justifyContent: "center", gap: 22 },
  logoArea: {
    alignItems: "center",
    justifyContent: "center",
    height: 120,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  titleBlock: { alignItems: "center", gap: 10 },
  appName: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  appTagline: {
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  authLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 4,
  },
  authButtons: { gap: 10 },
  authBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  authBtnIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  authBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    flex: 1,
  },
  legal: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  backBtn: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  providerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  providerBadgeText: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  nameInputArea: { gap: 6 },
  nameInput: {
    fontFamily: "Inter_500Medium",
    fontSize: 18,
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  charCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    textAlign: "right",
    paddingRight: 4,
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
    width: "100%",
  },
  startBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: "#fff",
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 4,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  featureTagText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
  },
  formFields: { gap: 12 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  fieldInput: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
  },
  otpInput: {
    textAlign: "center",
    letterSpacing: 6,
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  countryCode: {
    paddingRight: 10,
    borderRightWidth: 1,
    marginRight: 2,
  },
  countryCodeText: {
    fontFamily: "Inter_500Medium",
    fontSize: 14,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    borderRadius: 18,
    width: "100%",
  },
  primaryBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 17,
    color: "#fff",
  },
  toggleText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  errorBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  guestText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    textAlign: "center",
  },
  modeTabs: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeTabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
});
