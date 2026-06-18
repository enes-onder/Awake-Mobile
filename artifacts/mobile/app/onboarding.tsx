/**
 * onboarding.tsx — Uygulama ilk açılışında gösterilen karşılama akışı.
 *
 * İki adımlı akış:
 *  1. intro — IntroSlides: uygulamayı tanıtan animasyonlu slaytlar
 *  2. name  — QuickEntryScreen: kullanıcıdan kod adı giriş ekranı
 *
 * useOnboardingAuth hook'u isim validasyonu ve kaydetmeyi yönetir.
 * Kullanıcı adı kaydedildikten sonra /(tabs) rotasına otomatik yönlendirilir
 * (yönlendirme NavController tarafından _layout.tsx'de yapılır).
 */

import React, { useState } from "react";

import { IntroSlides } from "@/components/onboarding/IntroSlides";
import { QuickEntryScreen } from "@/components/onboarding/QuickEntryScreen";
import { useOnboardingAuth } from "@/hooks/useOnboardingAuth";

/** Onboarding akışının mevcut adımı */
type OnboardingStep = "intro" | "name";

export default function OnboardingScreen() {
  const auth = useOnboardingAuth();
  const [step, setStep] = useState<OnboardingStep>("intro");

  /** Adım 1: Tanıtım slaytları — "Başla" butonuna basınca isim ekranına geçilir */
  if (step === "intro") {
    return <IntroSlides onFinish={() => setStep("name")} />;
  }

  /** Adım 2: Kod adı girişi — auth hook üzerinden validasyon ve kaydetme yapılır */
  return (
    <QuickEntryScreen
      nameInput={auth.nameInput}
      setNameInput={auth.setNameInput}
      nameInputRef={auth.nameInputRef}
      canStart={auth.canStart}
      handleStart={auth.handleStart}
      onBack={() => setStep("intro")}
    />
  );
}
