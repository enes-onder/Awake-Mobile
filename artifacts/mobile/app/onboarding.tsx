import * as WebBrowser from "expo-web-browser";
import React from "react";

import { AuthStep } from "@/components/onboarding/AuthStep";
import { EmailStep } from "@/components/onboarding/EmailStep";
import { NameStep } from "@/components/onboarding/NameStep";
import { OtpStep } from "@/components/onboarding/OtpStep";
import { PhoneStep } from "@/components/onboarding/PhoneStep";
import { useOnboardingAuth } from "@/hooks/useOnboardingAuth";

WebBrowser.maybeCompleteAuthSession();

export default function OnboardingScreen() {
  const auth = useOnboardingAuth();

  if (auth.step === "auth") {
    return (
      <AuthStep
        loading={auth.loading}
        error={auth.error}
        selectedProvider={auth.selectedProvider}
        providerMap={auth.providerMap}
        handleProviderSelect={auth.handleProviderSelect}
        handleAnonymousSignIn={auth.handleAnonymousSignIn}
      />
    );
  }

  if (auth.step === "email") {
    return (
      <EmailStep
        loading={auth.loading}
        error={auth.error}
        emailInput={auth.emailInput}
        setEmailInput={auth.setEmailInput}
        passwordInput={auth.passwordInput}
        setPasswordInput={auth.setPasswordInput}
        isSignUp={auth.isSignUp}
        toggleSignUp={auth.toggleSignUp}
        showPassword={auth.showPassword}
        toggleShowPassword={auth.toggleShowPassword}
        emailMode={auth.emailMode}
        setEmailMode={auth.setEmailMode}
        clearError={auth.clearError}
        handleEmailAuth={auth.handleEmailAuth}
        onBack={() => { auth.setStep("auth"); auth.clearError(); }}
      />
    );
  }

  if (auth.step === "phone") {
    return (
      <PhoneStep
        loading={auth.loading}
        error={auth.error}
        phoneInput={auth.phoneInput}
        setPhoneInput={auth.setPhoneInput}
        handleSendOTP={auth.handleSendOTP}
        onBack={() => { auth.setStep("auth"); auth.clearError(); }}
      />
    );
  }

  if (auth.step === "otp") {
    return (
      <OtpStep
        loading={auth.loading}
        error={auth.error}
        phoneInput={auth.phoneInput}
        otpInput={auth.otpInput}
        setOtpInput={auth.setOtpInput}
        handleVerifyOTP={auth.handleVerifyOTP}
        handleSendOTP={auth.handleSendOTP}
        onBack={() => { auth.setStep("phone"); auth.clearError(); }}
      />
    );
  }

  return (
    <NameStep
      nameInput={auth.nameInput}
      setNameInput={auth.setNameInput}
      nameInputRef={auth.nameInputRef}
      canStart={auth.canStart}
      handleStart={auth.handleStart}
      selectedProvider={auth.selectedProvider}
      providerMap={auth.providerMap}
      onBack={() => auth.setStep("auth")}
    />
  );
}
