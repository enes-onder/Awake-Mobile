import React, { useState } from "react";

import { AuthScreen } from "@/components/onboarding/AuthScreen";
import { IntroSlides } from "@/components/onboarding/IntroSlides";
import { NameStep } from "@/components/onboarding/NameStep";
import { useOnboardingAuth } from "@/hooks/useOnboardingAuth";

type OnboardingStep = "intro" | "auth" | "name";

export default function OnboardingScreen() {
  const auth = useOnboardingAuth();
  const [step, setStep] = useState<OnboardingStep>("intro");

  if (step === "intro") {
    return <IntroSlides onFinish={() => setStep("auth")} />;
  }

  if (step === "auth") {
    return (
      <AuthScreen
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
        clearError={auth.clearError}
        handleEmailAuth={() => setStep("name")}
        handleAnonymousSignIn={() => setStep("name")}
        onBack={() => setStep("intro")}
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
      onBack={() => setStep("auth")}
    />
  );
}
