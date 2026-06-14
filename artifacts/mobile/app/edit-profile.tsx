import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useUser } from "@/context/UserContext";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";

const TOPICS = [
  { id: "politics", label: "Siyaset", icon: "flag" },
  { id: "health", label: "Sağlık", icon: "heart" },
  { id: "science", label: "Bilim", icon: "cpu" },
  { id: "economy", label: "Ekonomi", icon: "trending-up" },
  { id: "social", label: "Sosyal Medya", icon: "share-2" },
  { id: "environment", label: "Çevre", icon: "wind" },
  { id: "tech", label: "Teknoloji", icon: "monitor" },
  { id: "general", label: "Genel", icon: "globe" },
];

function SectionHeader({ label }: { label: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
      {label}
    </Text>
  );
}

export default function EditProfileScreen() {
  const colors = useColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useUser();

  const [usernameInput, setUsernameInput] = useState(user.username);
  const [bioInput, setBioInput] = useState(user.bio ?? "");
  const [favoriteTopic, setFavoriteTopic] = useState(user.favoriteTopic ?? "");
  const [showUsernameWarning, setShowUsernameWarning] = useState(false);

  const topPadding = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
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

  return (
    <Pressable style={{ flex: 1 }} onPress={Keyboard.dismiss}>
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
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
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={styles.topBar}
        >
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            Profili Düzenle
          </Text>
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: hasChanges ? colors.primary : colors.secondary },
            ]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={!hasChanges}
          >
            <Text
              style={[
                styles.saveBtnText,
                { color: hasChanges ? "#fff" : colors.mutedForeground },
              ]}
            >
              Kaydet
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()} style={{ gap: 6 }}>
          <SectionHeader label="KOD ADI" />
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: colors.secondary,
                borderColor: canChangeName ? colors.border : colors.border + "66",
              },
            ]}
          >
            <Feather
              name="user"
              size={16}
              color={canChangeName ? colors.primary : colors.mutedForeground}
              style={{ marginLeft: 14 }}
            />
            <TextInput
              style={[
                styles.input,
                { color: canChangeName ? colors.foreground : colors.mutedForeground },
              ]}
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholder="Kod adın"
              placeholderTextColor={colors.mutedForeground}
              maxLength={18}
              returnKeyType="done"
              editable={canChangeName}
              onFocus={() => {
                if (!canChangeName) setShowUsernameWarning(true);
              }}
            />
            {!canChangeName && (
              <View style={[styles.lockBadge, { backgroundColor: colors.border }]}>
                <Feather name="lock" size={12} color={colors.mutedForeground} />
              </View>
            )}
          </View>
          {canChangeName ? (
            <Text style={[styles.fieldHint, { color: colors.mutedForeground }]}>
              Kod adını ayda 1 kez değiştirebilirsin.
            </Text>
          ) : (
            <View style={[styles.warningRow, { backgroundColor: colors.warning + "14", borderColor: colors.warning + "33" }]}>
              <Feather name="clock" size={13} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                {daysLeft} gün sonra tekrar değiştirebilirsin
              </Text>
            </View>
          )}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(140).springify()} style={{ gap: 6, marginTop: 12 }}>
          <SectionHeader label="BİO" />
          <View
            style={[
              styles.inputWrap,
              styles.bioWrap,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <TextInput
              style={[styles.input, styles.bioInput, { color: colors.foreground }]}
              value={bioInput}
              onChangeText={setBioInput}
              placeholder="Kendini birkaç kelimeyle tanıt…"
              placeholderTextColor={colors.mutedForeground}
              maxLength={80}
              multiline
              returnKeyType="done"
              blurOnSubmit
            />
          </View>
          <Text style={[styles.fieldHint, { color: colors.mutedForeground, textAlign: "right" }]}>
            {bioInput.length}/80
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={{ gap: 10, marginTop: 12 }}>
          <SectionHeader label="FAVORİ KONU" />
          <View style={styles.topicsGrid}>
            {TOPICS.map((t) => {
              const selected = favoriteTopic === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.topicChip,
                    {
                      backgroundColor: selected ? colors.primary + "1A" : colors.secondary,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setFavoriteTopic(selected ? "" : t.id)}
                  activeOpacity={0.7}
                >
                  <Feather
                    name={t.icon as any}
                    size={14}
                    color={selected ? colors.primary : colors.mutedForeground}
                  />
                  <Text
                    style={[
                      styles.topicLabel,
                      { color: selected ? colors.primary : colors.foreground },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(260).springify()} style={{ marginTop: 16 }}>
          <View style={[styles.infoCard, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Feather name="info" size={14} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              Değişiklikler hemen kaydedilir ve tüm istatistiklerin korunur.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showUsernameWarning}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUsernameWarning(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowUsernameWarning(false)}
        >
          <Animated.View
            entering={FadeInUp.springify()}
            style={[styles.modalCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.modalIcon, { backgroundColor: colors.warning + "18" }]}>
              <Feather name="clock" size={26} color={colors.warning} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Değişiklik Sınırı
            </Text>
            <Text style={[styles.modalBody, { color: colors.mutedForeground }]}>
              Kod adını ayda yalnızca{" "}
              <Text style={{ color: colors.foreground, fontFamily: "Inter_700Bold" }}>1 kez</Text>{" "}
              değiştirebilirsin.{"\n\n"}Tekrar değiştirebilmek için{" "}
              <Text style={{ color: colors.warning, fontFamily: "Inter_700Bold" }}>
                {daysLeft} gün
              </Text>{" "}
              beklemelisin.
            </Text>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={() => setShowUsernameWarning(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnText}>Tamam, anladım</Text>
            </TouchableOpacity>
          </Animated.View>
        </Pressable>
      </Modal>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    flex: 1,
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  saveBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  bioWrap: {
    alignItems: "flex-start",
    minHeight: 90,
  },
  bioInput: {
    paddingHorizontal: 14,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  lockBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  fieldHint: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  warningRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
  },
  warningText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
  },
  topicsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  topicLabel: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 12,
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  modalTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
  },
  modalBody: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  modalBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 6,
  },
  modalBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: "#fff",
  },
});
