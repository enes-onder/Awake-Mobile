import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { TextInput } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
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
  const { setUsername } = useUser();

  const [step, setStep] = useState<Step>("name");
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

  const handleProviderSelect = (id: AuthProvider) => {
    setSelectedProvider(id);
    clearError();
    setStep("name");
  };

  const handleEmailAuth = async () => {
    setStep("name");
  };

  const handleSendOTP = async () => {
    setStep("name");
  };

  const handleVerifyOTP = async () => {
    setStep("name");
  };

  const handleAnonymousSignIn = async () => {
    setStep("name");
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
