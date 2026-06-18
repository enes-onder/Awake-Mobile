/**
 * useEditProfile — Profil düzenleme ekranının form state'ini yönetir.
 *
 * Kullanıcı adı, biyografi ve favori konu alanlarını UserContext ile senkronize eder.
 * Kullanıcı adı değişikliği 30 günlük kilit kuralına tabidir.
 */

import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard } from "react-native";

import { useUser } from "@/context/UserContext";

/** useEditProfile hook'unun dışarıya açtığı arayüz */
export interface EditProfileState {
  /** Form alanı — kullanıcı adı */
  usernameInput: string;
  setUsernameInput: (v: string) => void;
  /** Form alanı — biyografi */
  bioInput: string;
  setBioInput: (v: string) => void;
  /** Form alanı — favori konu */
  favoriteTopic: string;
  setFavoriteTopic: (v: string) => void;
  /** Kullanıcı adı 30 gün içinde değiştirildiyse uyarı modal'ını göster */
  showUsernameWarning: boolean;
  setShowUsernameWarning: (v: boolean) => void;
  /** Kullanıcı adı değiştirilebilir mi? */
  canChangeName: boolean;
  /** Kullanıcı adı değişikliğine kaç gün kaldı */
  daysLeft: number;
  /** Herhangi bir alanda değişiklik yapıldıysa true (kaydet butonunu aktifleştirir) */
  hasChanges: boolean;
  /** Formu doğrular ve kaydeder, ardından geri döner */
  handleSave: () => void;
}

export function useEditProfile(): EditProfileState {
  const router = useRouter();
  const user = useUser();

  const [usernameInput, setUsernameInput] = useState(user.username);
  const [bioInput, setBioInput] = useState(user.bio ?? "");
  const [favoriteTopic, setFavoriteTopic] = useState(user.favoriteTopic ?? "");
  const [showUsernameWarning, setShowUsernameWarning] = useState(false);

  const canChangeName = user.canChangeUsername();
  const daysLeft = user.daysUntilUsernameChange();

  const usernameChanged = usernameInput.trim() !== user.username;
  /** En az bir alanda değişiklik olduğunda true */
  const hasChanges =
    usernameChanged ||
    bioInput.trim() !== (user.bio ?? "") ||
    favoriteTopic !== (user.favoriteTopic ?? "");

  /**
   * Kaydet işlemi:
   * 1. Klavyeyi kapat
   * 2. Kullanıcı adı değiştiyse 30 günlük kural ve minimum uzunluk kontrolü yap
   * 3. Profil alanlarını güncelle
   * 4. Önceki ekrana dön
   */
  const handleSave = () => {
    Keyboard.dismiss();

    if (usernameChanged) {
      if (!canChangeName) {
        setShowUsernameWarning(true);
        return;
      }
      const trimmed = usernameInput.trim();
      if (trimmed.length < 2) {
        Alert.alert("Geçersiz Kod Adı", "Kod adın en az 2 karakter olmalı.");
        return;
      }
      user.setUsername(trimmed);
    }

    user.updateProfile({
      bio: bioInput.trim(),
      favoriteTopic,
    });

    router.back();
  };

  return {
    usernameInput,
    setUsernameInput,
    bioInput,
    setBioInput,
    favoriteTopic,
    setFavoriteTopic,
    showUsernameWarning,
    setShowUsernameWarning,
    canChangeName,
    daysLeft,
    hasChanges,
    handleSave,
  };
}
