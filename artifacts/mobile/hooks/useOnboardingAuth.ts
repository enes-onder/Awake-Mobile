/**
 * useOnboardingAuth — Onboarding ekranındaki kullanıcı adı girişini yönetir.
 *
 * Kullanıcıdan bir "kod adı" (username) alır, uzunluk kontrolü yapar ve
 * UserContext üzerinden kaydedip ana sekme navigasyonuna yönlendirir.
 */

import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { TextInput } from "react-native";

import { useUser } from "@/context/UserContext";

/** useOnboardingAuth hook'unun dışarıya açtığı arayüz */
export interface OnboardingAuthState {
  /** Kullanıcının girdiği kod adı metni */
  nameInput: string;
  /** Kod adı metnini günceller */
  setNameInput: (v: string) => void;
  /** TextInput bileşenine programatik erişim için ref (klavye fokus vb.) */
  nameInputRef: React.RefObject<TextInput | null>;
  /** Kod adı en az 2 karakter ise true — "Başla" butonu bu değere göre aktif olur */
  canStart: boolean;
  /** Kod adını UserContext'e yazar ve ana sekme ekranına geçiş yapar */
  handleStart: () => void;
}

export function useOnboardingAuth(): OnboardingAuthState {
  const router = useRouter();
  const { setUsername } = useUser();

  /** Kullanıcının yazdığı ham metin */
  const [nameInput, setNameInput] = useState("");

  /** Başlat butonuna basıldığında klavyeyi kapatmak için kullanılır */
  const nameInputRef = useRef<TextInput>(null);

  /** En az 2 karakter girilmeden oyuna başlanamaz */
  const canStart = nameInput.trim().length >= 2;

  /**
   * Boşlukları temizlenmiş kod adını global kullanıcı state'ine yazar,
   * ardından /(tabs) rotasına geçer.
   */
  const handleStart = () => {
    const name = nameInput.trim();
    if (!name) return;
    setUsername(name);
    router.replace("/(tabs)");
  };

  return {
    nameInput,
    setNameInput,
    nameInputRef,
    canStart,
    handleStart,
  };
}
