/**
 * edit-profile.tsx — Profil düzenleme ekranı.
 *
 * Kullanıcı kod adını, biyografisini ve favori konusunu değiştirebilir.
 * Tüm form state'i useEditProfile hook'u tarafından yönetilir.
 *
 * Özel kurallar:
 *  - Kullanıcı adı son 30 gün içinde değiştirildiyse alan kilitlenir
 *  - Kilitli alana dokunulunca UsernameWarningModal gösterilir
 *  - Değişiklik yapılmadıysa "Kaydet" butonu pasif kalır
 */

import { useRouter } from "expo-router";
import React from "react";
import { Keyboard, Platform, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BioField } from "@/components/edit-profile/BioField";
import { EditProfileTopBar } from "@/components/edit-profile/EditProfileTopBar";
import { InfoCard } from "@/components/edit-profile/InfoCard";
import { TopicsPicker } from "@/components/edit-profile/TopicsPicker";
import { UsernameField } from "@/components/edit-profile/UsernameField";
import { UsernameWarningModal } from "@/components/edit-profile/UsernameWarningModal";
import { useColors } from "@/hooks/useColors";
import { useEditProfile } from "@/hooks/useEditProfile";
import { useResponsive } from "@/hooks/useResponsive";

export default function EditProfileScreen() {
  const colors = useColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const profile = useEditProfile();

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;

  return (
    /** Ekrana dokunulduğunda klavyeyi kapat */
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <ScrollView
        style={[{ flex: 1 }, { backgroundColor: colors.background }]}
        contentContainerStyle={{
          paddingTop: topPadding + 8,
          paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 40,
          paddingHorizontal: r.hp,
          gap: 6,
          maxWidth: r.maxW,
          alignSelf: "center" as const,
          width: "100%",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Geri butonu + Kaydet butonu (değişiklik yoksa pasif) */}
        <EditProfileTopBar
          hasChanges={profile.hasChanges}
          onBack={() => router.back()}
          onSave={profile.handleSave}
        />

        {/* Kullanıcı adı alanı — 30 günlük kilitli olabilir */}
        <UsernameField
          value={profile.usernameInput}
          onChangeText={profile.setUsernameInput}
          canChangeName={profile.canChangeName}
          daysLeft={profile.daysLeft}
          onLockedFocus={() => profile.setShowUsernameWarning(true)}
        />

        <BioField
          value={profile.bioInput}
          onChangeText={profile.setBioInput}
        />

        {/* Favori konu seçici — ön tanımlı kategoriler listesi */}
        <TopicsPicker
          selected={profile.favoriteTopic}
          onSelect={profile.setFavoriteTopic}
        />

        <InfoCard />
      </ScrollView>

      {/* Kullanıcı adı kilit uyarı modal'ı — kalan gün sayısını gösterir */}
      <UsernameWarningModal
        visible={profile.showUsernameWarning}
        daysLeft={profile.daysLeft}
        onClose={() => profile.setShowUsernameWarning(false)}
      />
    </Pressable>
  );
}
