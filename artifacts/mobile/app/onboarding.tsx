import React, { useState } from "react";

import { IntroSlides } from "@/components/onboarding/IntroSlides";
import { NameStep } from "@/components/onboarding/NameStep";
import { useOnboardingAuth } from "@/hooks/useOnboardingAuth";

type OnboardingStep = "intro" | "name";

export default function OnboardingScreen() {
  const auth = useOnboardingAuth();
  const [step, setStep] = useState<OnboardingStep>("intro");

  if (step === "intro") {
    return <IntroSlides onFinish={() => setStep("name")} />;
  }

  return (
    <NameStep
      nameInput={auth.nameInput}
      setNameInput={auth.setNameInput}
      nameInputRef={auth.nameInputRef}
      canStart={auth.canStart}
      handleStart={auth.handleStart}
      onBack={() => setStep("intro")}
    />
  );
}
