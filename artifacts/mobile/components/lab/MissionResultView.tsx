import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useResponsive } from "@/hooks/useResponsive";
import type { Mission } from "@/data/missions";

import { styles } from "./labStyles";

/** Standart iOS/Android tab bar içerik yüksekliği (px). Safe area inset'e eklenir. */
const TAB_BAR_CONTENT_HEIGHT = 49;

interface MissionResultViewProps {
  activeMission: Mission;
  lastCorrect: boolean;
  lastXP: number;
  lastMultiplier: number;
  pendingMissionsCount: number;
  topPadding: number;
  bottomInset: number;
  onNextMission: () => void;
  onBackToList: () => void;
}

export function MissionResultView({
  activeMission,
  lastCorrect,
  lastXP,
  lastMultiplier,
  pendingMissionsCount,
  topPadding,
  bottomInset,
  onNextMission,
  onBackToList,
}: MissionResultViewProps) {
  const colors = useColors();
  const r = useResponsive();

  return (
    <View style={[styles.resultPage, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: topPadding + 16,
          paddingBottom: 24,
          paddingHorizontal: r.hp,
          maxWidth: r.maxW,
          alignSelf: "center",
          width: "100%",
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          entering={FadeInDown.delay(60).duration(380).springify()}
          style={[
            styles.resultCard,
            {
              backgroundColor: colors.card,
              borderColor: lastCorrect
                ? colors.success + "66"
                : colors.fake + "66",
            },
          ]}
        >
          <View
            style={[
              styles.resultIconCircle,
              {
                backgroundColor: lastCorrect
                  ? colors.success + "22"
                  : colors.fake + "22",
              },
            ]}
          >
            <Feather
              name={lastCorrect ? "check-circle" : "x-circle"}
              size={40}
              color={lastCorrect ? colors.success : colors.fake}
            />
          </View>

          <Text
            style={[
              styles.resultHeadline,
              { color: lastCorrect ? colors.success : colors.fake },
            ]}
          >
            {lastCorrect ? "Doğru Tespit!" : "Yanlış Tahmin"}
          </Text>

          <Text style={[styles.resultMission, { color: colors.foreground }]}>
            {activeMission.title}
          </Text>

          <View
            style={[
              styles.xpEarnedBox,
              {
                backgroundColor:
                  (lastXP >= 0 ? colors.warning : colors.fake) + "18",
                borderColor:
                  (lastXP >= 0 ? colors.warning : colors.fake) + "44",
              },
            ]}
          >
            <Feather
              name="zap"
              size={18}
              color={lastXP >= 0 ? colors.warning : colors.fake}
            />
            <View>
              <Text
                style={[
                  styles.xpEarnedText,
                  { color: lastXP >= 0 ? colors.warning : colors.fake },
                ]}
              >
                {lastXP >= 0
                  ? `+${lastXP} XP kazandın`
                  : `${lastXP} XP kaybettin`}
              </Text>
              {lastXP >= 0 && lastMultiplier > 1 && (
                <Text
                  style={{
                    color: colors.warning,
                    fontFamily: "Inter_400Regular",
                    fontSize: 11,
                    opacity: 0.8,
                  }}
                >
                  Günlük 2× bonus dahil!
                </Text>
              )}
            </View>
          </View>

          <View style={[styles.verdictBox, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.verdictLabel, { color: colors.mutedForeground }]}>
              Gerçek durum:
            </Text>
            <View
              style={[
                styles.verdictTag,
                {
                  backgroundColor:
                    activeMission.verdict === "real"
                      ? colors.success + "22"
                      : colors.fake + "22",
                },
              ]}
            >
              <Text
                style={[
                  styles.verdictTagText,
                  {
                    color:
                      activeMission.verdict === "real"
                        ? colors.success
                        : colors.fake,
                  },
                ]}
              >
                {activeMission.verdict === "real" ? "DOĞRU HABER" : "YANLIŞ HABER"}
              </Text>
            </View>
          </View>

          <Text style={[styles.explanationText, { color: colors.mutedForeground }]}>
            {activeMission.explanation}
          </Text>
        </Animated.View>
      </ScrollView>

      <Animated.View
        entering={FadeInDown.delay(200).duration(320).springify()}
        style={[
          styles.resultActionBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: Platform.OS === "web" ? 100 : bottomInset + TAB_BAR_CONTENT_HEIGHT + 8,
            paddingHorizontal: r.hp,
          },
        ]}
      >
        <View
          style={{
            maxWidth: r.maxW,
            alignSelf: "center",
            width: "100%",
            gap: 10,
          }}
        >
          {pendingMissionsCount > 1 && (
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: colors.primary }]}
              onPress={onNextMission}
              activeOpacity={0.8}
            >
              <Text style={[styles.nextBtnText, { color: "#fff" }]}>
                Sonraki Vaka
              </Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.listBtn, { borderColor: colors.border }]}
            onPress={onBackToList}
            activeOpacity={0.7}
          >
            <Text style={[styles.listBtnText, { color: colors.foreground }]}>
              Vaka Listesine Dön
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
