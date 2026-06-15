import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useRef, useState } from "react";
import { Platform, TextInput } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { supabase } from "@/lib/supabase";
import type { AuthProvider, ProviderItem, Step } from "@/components/onboarding/types";

export interface OnboardingAuthState {
  step: Step;
  setStep: (s: Step) => void;
  selectedProvider: AuthProvider | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;

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

  phoneInput: string;
  setPhoneInput: (v: string) => void;
  otpInput: string;
  setOtpInput: (v: string) => void;

  nameInput: string;
  setNameInput: (v: string) => void;
  nameInputRef: React.RefObject<TextInput>;
  canStart: boolean;

  providerMap: ProviderItem[];
  provider: ProviderItem | undefined;

  handleProviderSelect: (id: AuthProvider) => void;
  handleEmailAuth: () => Promise<void>;
  handleSendOTP: () => Promise<void>;
  handleVerifyOTP: () => Promise<void>;
  handleAnonymousSignIn: () => Promise<void>;
  handleStart: () => void;
}

export function useOnboardingAuth(): OnboardingAuthState {
  const colors = useColors();
  const router = useRouter();
  const { setUsername, signInAnonymously, authUser, username } = useUser();

  const [step, setStep] = useState<Step>("auth");
  const [selectedProvider, setSelectedProvider] = useState<AuthProvider | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailMode, setEmailMode] = useState<"password" | "magic">("password");

  const [phoneInput, setPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");

  const [nameInput, setNameInput] = useState("");
  const nameInputRef = useRef<TextInput>(null);

  const clearError = () => setError(null);
  const canStart = nameInput.trim().length >= 2;

  const providerMap: ProviderItem[] = [
    { id: "google", label: "Google ile Giriş Yap", icon: "globe", color: "#EA4335" },
    { id: "apple", label: "Apple ile Giriş Yap", icon: "smartphone", color: "#FFFFFF" },
    { id: "email", label: "E-posta ile Kayıt Ol", icon: "mail", color: colors.primary },
    { id: "phone", label: "Telefon ile Devam Et", icon: "phone", color: colors.success },
  ];

  const provider = providerMap.find((p) => p.id === selectedProvider);

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

  return {
    step,
    setStep,
    selectedProvider,
    loading,
    error,
    clearError,
    emailInput,
    setEmailInput,
    passwordInput,
    setPasswordInput,
    isSignUp,
    toggleSignUp: () => setIsSignUp((v) => !v),
    showPassword,
    toggleShowPassword: () => setShowPassword((v) => !v),
    emailMode,
    setEmailMode,
    phoneInput,
    setPhoneInput,
    otpInput,
    setOtpInput,
    nameInput,
    setNameInput,
    nameInputRef,
    canStart,
    providerMap,
    provider,
    handleProviderSelect,
    handleEmailAuth,
    handleSendOTP,
    handleVerifyOTP,
    handleAnonymousSignIn,
    handleStart,
  };
}
