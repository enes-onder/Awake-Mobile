import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { SwipeCard } from "@/components/SwipeCard";
import { XPFloater } from "@/components/XPFloater";
import { useBottomChromeSpacing } from "@/hooks/useBottomChromeSpacing";
import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";
import { useUser } from "@/context/UserContext";
import type { Mission } from "@/data/missions";
import { styles } from "./labStyles";

interface ActiveMissionViewProps {
  activeMission: Mission;
  currentMissionIdx: number;
  pendingMissionsCount: number;
  clueIndex: number;
  celebVisible: boolean;
  celebCorrect: boolean;
  xpFloaterVisible: boolean;
  xpFloaterAmount: number;
  topPadding: number;
  bottomInset: number;
  onBack: () => void;
  onVerdictSelected: (verdict: "real" | "fake") => void;
  onUseClue: () => void;
  onXPFloaterDone: () => void;
}

export function ActiveMissionView({
  activeMission,
  currentMissionIdx,
  pendingMissionsCount,
  clueIndex,
  celebVisible,
  celebCorrect,
  xpFloaterVisible,
  xpFloaterAmount,
  topPadding,
  bottomInset,
  onBack,
  onVerdictSelected,
  onUseClue,
  onXPFloaterDone,
}: ActiveMissionViewProps) {
  const colors = useColors();
  const r = useResponsive();
  const user = useUser();
  /** Tab bar (position:absolute) + safe area + dokunma dolgusu */
  const safeBottom = useBottomChromeSpacing();

  /**
   * XPFloater'ı karar butonları ve bottom tab'ın üzerinde konumlandır.
   * safeBottom: tab bar yüksekliğini ve safe area'yı kapsar.
   * +74: verdict buton alanını (~52px buton + gap) aşacak kadar boşluk.
   * Sonuç cihaz bağımsız — magic number veya cihaz modeli yok.
   */
  const xpFloaterBottom = safeBottom + 74;

  const feedbackColor = celebCorrect ? "#00C851" : "#FF3B30";
  const feedbackBg = celebCorrect ? "rgba(0,200,81,0.18)" : "rgba(255,59,48,0.18)";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Sabit üst başlık */}
      <View
        style={{
          paddingTop: topPadding + 14,
          paddingHorizontal: r.hp,
          paddingBottom: 10,
          gap: 10,
          maxWidth: r.maxW,
          alignSelf: "center",
          width: "100%",
        }}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.activeHeader}>
          <TouchableOpacity
            onPress={onBack}
            style={[styles.backBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
          </TouchableOpacity>
          <View style={styles.activeHeaderMeta}>
            <Text
              style={[styles.activeTitle, { color: colors.foreground }]}
              numberOfLines={1}
            >
              {activeMission.title}
            </Text>
            <Text style={[styles.activeSub, { color: colors.mutedForeground }]}>
              {currentMissionIdx + 1}/{pendingMissionsCount} · Vaka Analizi
            </Text>
          </View>
          {/* Mevcut toplam XP'yi kompakt pill olarak göster */}
          <View
            style={[
              styles.activeXpPill,
              {
                backgroundColor: colors.warning + "18",
                borderColor: colors.warning + "44",
              },
            ]}
          >
            <Feather name="zap" size={12} color={colors.warning} />
            <Text style={[styles.activeXpPillText, { color: colors.warning }]}>
              {user.xp} XP
            </Text>
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(60).springify()}
          style={[
            styles.instructionBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Feather name="info" size={14} color={colors.mutedForeground} />
          <Text style={[styles.instructionText, { color: colors.mutedForeground }]}>
            Kaydır:{" "}
            <Text style={{ color: colors.success, fontFamily: "Inter_700Bold" }}>
              Sağ = Doğru
            </Text>
            {"  "}
            <Text style={{ color: colors.fake, fontFamily: "Inter_700Bold" }}>
              Sol = Yanlış
            </Text>
          </Text>
          {/* Vakanın ipucu cezası sonrası tahmini net ödülü — anlaşılır etiketle */}
          {(() => {
            const gross = Math.round(activeMission.xpReward * user.dailyXPMultiplier);
            const net = Math.max(0, gross - clueIndex * 5);
            const rewardColor = clueIndex > 0 ? colors.fake : colors.warning;
            return (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 3, marginLeft: 4, flexShrink: 0 }}>
                <Feather name="zap" size={11} color={rewardColor} />
                <Text
                  style={{
                    fontFamily: "Inter_700Bold",
                    fontSize: 12,
                    color: rewardColor,
                  }}
                >
                  {`Net ${net > 0 ? `+${net}` : net} XP`}
                </Text>
              </View>
            );
          })()}
        </Animated.View>
      </View>

      {/* Inline geri bildirim banner'ı — header ile kart arasında, overlay değil */}
      {celebVisible && (
        <Animated.View
          entering={FadeInDown.duration(200).springify()}
          style={{
            paddingHorizontal: r.hp,
            paddingBottom: 8,
            maxWidth: r.maxW,
            alignSelf: "center",
            width: "100%",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              paddingHorizontal: 16,
              paddingVertical: 11,
              borderRadius: 14,
              borderWidth: 1.5,
              backgroundColor: feedbackBg,
              borderColor: feedbackColor + "99",
            }}
          >
            <Feather
              name={celebCorrect ? "check-circle" : "x-circle"}
              size={20}
              color={feedbackColor}
            />
            <View style={{ gap: 2, flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Inter_700Bold",
                  fontSize: 14,
                  color: feedbackColor,
                }}
              >
                {celebCorrect ? "Doğru Tespit!" : "Yanlış Tahmin"}
              </Text>
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  fontSize: 12,
                  color: "rgba(255,255,255,0.65)",
                }}
              >
                {celebCorrect ? "Harika iş, ajan!" : "Dezenformasyon bu sefer kazandı"}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Kart alanı — kalan alanı doldurur, kart ortaya hizalanır */}
      <View
        style={{
          flex: 1,
          paddingHorizontal: r.hp,
          paddingBottom: safeBottom,
          maxWidth: r.maxW,
          alignSelf: "center",
          width: "100%",
          justifyContent: "center",
        }}
      >
        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <SwipeCard
            key={activeMission.id}
            mission={activeMission}
            clueIndex={clueIndex}
            onVerdictSelected={onVerdictSelected}
            onUseClue={onUseClue}
          />
        </Animated.View>
      </View>

      {/**
       * XPFloater: safeBottom + 74px — tab bar ve karar butonlarının üzerinde.
       * Negatif amount (ipucu) kırmızı, pozitif (karar) amber renkte gösterilir.
       */}
      <XPFloater
        visible={xpFloaterVisible}
        amount={xpFloaterAmount}
        onDone={onXPFloaterDone}
        bottomOffset={xpFloaterBottom}
      />
    </View>
  );
}
