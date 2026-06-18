import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Keyboard,
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

const { width: SCREEN_W } = Dimensions.get("window");

interface QuickEntryScreenProps {
  nameInput: string;
  setNameInput: (v: string) => void;
  nameInputRef: React.RefObject<TextInput | null>;
  canStart: boolean;
  handleStart: () => void;
  onBack: () => void;
}

export function QuickEntryScreen({
  nameInput,
  setNameInput,
  nameInputRef,
  canStart,
  handleStart,
  onBack,
}: QuickEntryScreenProps) {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? Math.max(insets.top, 67) : insets.top;
  const botPad = Math.max(insets.bottom, 20);

  return (
    <Pressable style={styles.root} onPress={Keyboard.dismiss}>
      {/* Background grid */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {[...Array(8)].map((_, i) => (
          <View key={i} style={[styles.gridLine, { top: (SCREEN_W * i) / 4 }]} />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: topPad + 16,
          paddingBottom: botPad + 28,
          paddingHorizontal: 24,
          maxWidth: 430,
          alignSelf: "center",
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Feather name="arrow-left" size={18} color="#8892A4" />
        </TouchableOpacity>

        {/* Logo area */}
        <Animated.View entering={FadeInUp.springify()} style={styles.logoArea}>
          <View style={styles.logoCircle}>
            <Feather name="shield" size={38} color="#2B7FFF" />
          </View>
          <View style={[styles.glowRing, { borderColor: "#2B7FFF33" }]} />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.titleBlock}>
          <Text style={styles.title}>Kod Adını Seç, Ajan</Text>
          <Text style={styles.subtitle}>
            Misyonlarında seni bu isim temsil edecek.{"\n"}
            İstediğin zaman profilinden değiştirebilirsin.
          </Text>
        </Animated.View>

        {/* Code name input */}
        <Animated.View entering={FadeInDown.delay(170).springify()} style={styles.inputArea}>
          <View style={[styles.inputWrap, canStart && styles.inputWrapActive]}>
            <Feather name="user" size={16} color={canStart ? "#2B7FFF" : "#5C6B82"} />
            <TextInput
              ref={nameInputRef}
              style={styles.input}
              placeholder="Örn: GizliAjan42"
              placeholderTextColor="#3A4A5E"
              value={nameInput}
              onChangeText={setNameInput}
              maxLength={18}
              autoCorrect={false}
              autoCapitalize="none"
              onSubmitEditing={canStart ? handleStart : undefined}
              returnKeyType="go"
            />
            {nameInput.length > 0 && (
              <Text style={styles.charCount}>{nameInput.length}/18</Text>
            )}
          </View>
        </Animated.View>

        {/* Hızlı Giriş (Anonim) CTA */}
        <Animated.View entering={FadeInDown.delay(230).springify()} style={{ marginTop: 14 }}>
          <TouchableOpacity
            style={[styles.startBtn, !canStart && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={!canStart}
            activeOpacity={0.85}
          >
            <Feather name="zap" size={19} color="#fff" />
            <Text style={styles.startBtnText}>Hızlı Giriş (Anonim)</Text>
          </TouchableOpacity>
          <Text style={styles.anonNote}>Hesap oluşturmadan, kaydedilmez</Text>
        </Animated.View>

        {/* OR divider */}
        <Animated.View entering={FadeInDown.delay(290).springify()} style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>veya</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* Google mock */}
        <Animated.View entering={FadeInDown.delay(340).springify()}>
          <SocialButton
            label="Google ile Devam Et"
            iconName="globe"
            accentColor="#EA4335"
          />
        </Animated.View>

        {/* Apple mock */}
        <Animated.View entering={FadeInDown.delay(390).springify()} style={{ marginTop: 10 }}>
          <SocialButton
            label="Apple ile Devam Et"
            iconName="smartphone"
            accentColor="#AAAAAA"
          />
        </Animated.View>

        {/* Feature pills */}
        <Animated.View entering={FadeInDown.delay(450).springify()} style={styles.featureRow}>
          {[
            { icon: "zap", text: "XP Kazan" },
            { icon: "trending-up", text: "Seri Kur" },
            { icon: "award", text: "Rozet Al" },
          ].map((f) => (
            <View key={f.text} style={styles.featureTag}>
              <Feather name={f.icon as any} size={12} color="#F59E0B" />
              <Text style={styles.featureTagText}>{f.text}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </Pressable>
  );
}

function SocialButton({
  label,
  iconName,
  accentColor,
}: {
  label: string;
  iconName: string;
  accentColor: string;
}) {
  return (
    <View style={styles.socialBtn}>
      <View style={[styles.socialIconBox, { backgroundColor: accentColor + "1A" }]}>
        <Feather name={iconName as any} size={18} color={accentColor} />
      </View>
      <Text style={styles.socialLabel}>{label}</Text>
      <View style={styles.soonBadge}>
        <Text style={styles.soonText}>Yakında</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#070B14",
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#2B7FFF",
    opacity: 0.04,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D1627",
    borderWidth: 1,
    borderColor: "#1B2A42",
  },
  logoArea: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 36,
    marginBottom: 28,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: "#0D1E3D",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2B7FFF44",
  },
  glowRing: {
    position: "absolute",
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
  },
  titleBlock: {
    alignItems: "center",
    gap: 10,
    marginBottom: 28,
  },
  title: {
    fontFamily: "Inter_700Bold",
    fontSize: 26,
    color: "#E8EDF5",
    textAlign: "center",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: "#5C6B82",
    textAlign: "center",
    lineHeight: 22,
  },
  inputArea: {
    gap: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1B2A42",
    backgroundColor: "#0D1627",
  },
  inputWrapActive: {
    borderColor: "#2B7FFF",
    backgroundColor: "#0D1E3D",
  },
  input: {
    flex: 1,
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: "#E8EDF5",
    letterSpacing: 0.3,
  },
  charCount: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#5C6B82",
  },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 17,
    borderRadius: 16,
    backgroundColor: "#2B7FFF",
    width: "100%",
  },
  startBtnDisabled: {
    backgroundColor: "#142340",
    opacity: 0.5,
  },
  startBtnText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: "#fff",
    letterSpacing: 0.2,
  },
  anonNote: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: "#3A4A5E",
    textAlign: "center",
    marginTop: 6,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#1B2A42",
  },
  dividerText: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: "#3A4A5E",
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#1B2A42",
    backgroundColor: "#0D1627",
    opacity: 0.65,
  },
  socialIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  socialLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: "#8892A4",
    flex: 1,
  },
  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: "#F59E0B1A",
  },
  soonText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: "#F59E0B",
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 28,
  },
  featureTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#0D1627",
    borderWidth: 1,
    borderColor: "#1B2A42",
  },
  featureTagText: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: "#5C6B82",
  },
});
