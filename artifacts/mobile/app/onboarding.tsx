import React from "react";

import { NameStep } from "@/components/onboarding/NameStep";
import { useOnboardingAuth } from "@/hooks/useOnboardingAuth";

export default function OnboardingScreen() {
  const auth = useOnboardingAuth();

  return (
    <NameStep
      nameInput={auth.nameInput}
      setNameInput={auth.setNameInput}
      nameInputRef={auth.nameInputRef}
      canStart={auth.canStart}
      handleStart={auth.handleStart}
      selectedProvider={auth.selectedProvider}
      providerMap={auth.providerMap}
      onBack={() => {}}
    />
  );
}
