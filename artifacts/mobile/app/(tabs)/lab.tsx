/**
 * (tabs)/lab.tsx — Haber Lab ekranı.
 *
 * Kullanıcının gerçek/sahte haber analizi yapabileceği interaktif oyun alanı.
 * İki ana sekme:
 *  - "vakalar"   → Vaka Analizi: haber parçacıklarını gerçek/sahte olarak etiketleme
 *  - "simulasyon" → Simülasyon: senaryo tabanlı karar ağacı alıştırmaları
 *
 * Akış yönetimi useLabState hook'u tarafından yapılır.
 * Aktif simülasyon varsa SimulationPlayer tam ekran gösterilir.
 * Aktif vaka "active" aşamasındaysa ActiveMissionView, "result" aşamasındaysa MissionResultView.
 */

import React from "react";
import { Platform, ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { SimulationPlayer } from "@/components/SimulationPlayer";
import { XPFloater } from "@/components/XPFloater";
import { ActiveMissionView } from "@/components/lab/ActiveMissionView";
import { LabTabButton } from "@/components/lab/LabTabButton";
import { MissionResultView } from "@/components/lab/MissionResultView";
import { SimulasyonTab } from "@/components/lab/SimulasyonTab";
import { VakalarTab } from "@/components/lab/VakalarTab";
import { styles } from "@/components/lab/labStyles";
import { useColors } from "@/hooks/useColors";
import { useLabState } from "@/hooks/useLabState";

export default function LabScreen() {
  const colors = useColors();
  const lab = useLabState();

  /** Simülasyon oynanıyorsa tam ekran SimulationPlayer göster */
  if (lab.activeSim && lab.activeSim_data) {
    return (
      <View style={{ flex: 1 }}>
        <SimulationPlayer
          simulation={lab.activeSim_data}
          onComplete={(xp) => lab.handleSimComplete(lab.activeSim!, xp)}
          onExit={lab.handleSimExit}
        />
        <XPFloater
          visible={lab.xpFloaterVisible}
          amount={lab.xpFloaterAmount}
          onDone={() => lab.setXpFloaterVisible(false)}
        />
      </View>
    );
  }

  /** Vaka aktif aşamasındaysa vaka oynatıcı bileşenini göster */
  if (lab.labState === "active" && lab.activeMission) {
    return (
      <ActiveMissionView
        activeMission={lab.activeMission}
        currentMissionIdx={lab.currentMissionIdx}
        pendingMissionsCount={lab.pendingMissions.length}
        clueIndex={lab.clueIndex}
        celebVisible={lab.celebVisible}
        celebCorrect={lab.celebCorrect}
        xpFloaterVisible={lab.xpFloaterVisible}
        xpFloaterAmount={lab.xpFloaterAmount}
        topPadding={lab.topPadding}
        bottomInset={lab.bottomInset}
        onBack={() => lab.setLabState("list")}
        onVerdictSelected={lab.handleVerdict}
        onUseClue={lab.handleUseClue}
        onXPFloaterDone={() => lab.setXpFloaterVisible(false)}
      />
    );
  }

  /** Karar verildi, sonuç bekleniyor — sonuç özet ekranını göster */
  if (lab.labState === "result" && lab.activeMission) {
    return (
      <MissionResultView
        activeMission={lab.activeMission}
        lastCorrect={lab.lastCorrect}
        lastXP={lab.lastXP}
        lastMultiplier={lab.lastMultiplier}
        pendingMissionsCount={lab.pendingMissions.length}
        topPadding={lab.topPadding}
        bottomInset={lab.bottomInset}
        onNextMission={lab.handleNextMission}
        onBackToList={() => lab.setLabState("list")}
      />
    );
  }

  /** Varsayılan: vaka/simülasyon liste ekranı */
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: lab.topPadding + 16,
          paddingBottom: Platform.OS === "web" ? 100 : lab.bottomInset + 90,
          paddingHorizontal: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Ekran başlığı */}
        <Animated.View
          entering={FadeInDown.delay(0).springify()}
          style={styles.listHeader}
        >
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>
            Haber Lab.
          </Text>
          <Text style={[styles.pageSub, { color: colors.mutedForeground }]}>
            Analiz et · Simüle et · Karar ver
          </Text>
        </Animated.View>

        {/* Sekme geçiş butonları */}
        <Animated.View
          entering={FadeInDown.delay(80).springify()}
          style={styles.tabsRow}
        >
          <LabTabButton
            label="Vaka Analizi"
            icon="activity"
            active={lab.activeTab === "vakalar"}
            onPress={() => lab.setActiveTab("vakalar")}
          />
          <LabTabButton
            label="Simülasyon"
            icon="layers"
            active={lab.activeTab === "simulasyon"}
            onPress={() => lab.setActiveTab("simulasyon")}
          />
        </Animated.View>

        {lab.activeTab === "vakalar" && (
          <VakalarTab
            pendingMissions={lab.pendingMissions}
            completedMissions={lab.completedMissions}
            onStartMission={lab.handleStartMission}
          />
        )}

        {lab.activeTab === "simulasyon" && (
          <SimulasyonTab
            simulations={lab.simulations}
            completedSims={lab.completedSims}
            onStartSim={lab.setActiveSim}
          />
        )}
      </ScrollView>

      <XPFloater
        visible={lab.xpFloaterVisible}
        amount={lab.xpFloaterAmount}
        onDone={() => lab.setXpFloaterVisible(false)}
      />
    </View>
  );
}
