import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Keyboard } from "react-native";

import { useUser } from "@/context/UserContext";

export interface EditProfileState {
  usernameInput: string;
  setUsernameInput: (v: string) => void;
  bioInput: string;
  setBioInput: (v: string) => void;
  favoriteTopic: string;
  setFavoriteTopic: (v: string) => void;
  showUsernameWarning: boolean;
  setShowUsernameWarning: (v: boolean) => void;
  canChangeName: boolean;
  daysLeft: number;
  hasChanges: boolean;
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
  const hasChanges =
    usernameChanged ||
    bioInput.trim() !== (user.bio ?? "") ||
    favoriteTopic !== (user.favoriteTopic ?? "");

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
