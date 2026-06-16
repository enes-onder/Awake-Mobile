# Bileşenler (Components)

Her dosya Tek Sorumluluk İlkesi (Single Responsibility) ile tasarlanmıştır.

---

## SwipeCard (`components/SwipeCard.tsx`)

**Rol:** Orchestrator — alt bileşenleri koordine eder (~65 satır)  
**Props:** `mission: Mission`, `clueIndex: number`, `onVerdictSelected`, `onUseClue`

### Alt Bileşenler

| Dosya | Sorumluluk |
|-------|-----------|
| `swipe/swipeConstants.ts` | PLATFORM_ICONS, PLATFORM_COLORS, SWIPE_THRESHOLD sabitleri |
| `swipe/swipeCardStyles.ts` | Tüm StyleSheet tanımları |
| `swipe/useSwipeGesture.ts` | PanResponder + XP ceza animasyonu (Reanimated shared values) |
| `swipe/SwipeOverlays.tsx` | Sürükleme sırasındaki DOĞRU/YANLIŞ overlay + kilit damgası |
| `swipe/PostContent.tsx` | Platform barı, kullanıcı başlığı, metin, görsel etiketi, istatistikler |
| `swipe/CluesArea.tsx` | Açılan ipuçları listesi |
| `swipe/VerdictButtons.tsx` | "İpucu Al" butonu + DOĞRU / YANLIŞ karar butonları |

### `useSwipeGesture` Hook API

```ts
useSwipeGesture({ width, onVerdictSelected })
// Döndürür:
{
  pan,              // Animated.ValueXY
  swiping,          // "real" | "fake" | null
  verdictLocked,    // "real" | "fake" | null
  panResponder,     // PanResponder instance
  rotate,           // interpolated Animated
  realOpacity,      // interpolated Animated
  fakeOpacity,      // interpolated Animated
  triggerVerdict,   // (verdict: "real" | "fake") => void
  showXPPenalty,    // () => void
  xpPenaltyAnimStyle // AnimatedStyleProp<ViewStyle>
}
```

---

## SimulationPlayer (`components/SimulationPlayer.tsx`)

**Rol:** Orchestrator — simülasyon akışını yönetir (~170 satır)  
**Props:** `simulation: Simulation`, `onComplete: (xpEarned: number) => void`, `onExit: () => void`

### Durum Makinesi

```
idle → step[0] → step[1] → ... → step[n] → isDone
        ↓
     narrative: devam et butonu gösterilir
     choice: seçenek seçilir → sonuç → devam et
```

### Alt Bileşenler

| Dosya | Sorumluluk |
|-------|-----------|
| `simulation/simStyles.ts` | Tüm StyleSheet tanımları |
| `simulation/AnimatedChoiceButton.tsx` | Giriş animasyonlu, sonuç renkli seçenek butonu |
| `simulation/SimTopBar.tsx` | Kapat butonu + animasyonlu ilerleme çubuğu |
| `simulation/NarrativeStep.tsx` | Anlatı kartı (step.type === "narrative") |
| `simulation/ChoiceStep.tsx` | Seçenekler + animasyonlu açıklama (step.type === "choice") |
| `simulation/SimDoneScreen.tsx` | Tamamlanma ekranı (alternatif versiyon) |
| `simulation/SimContinueBar.tsx` | Alt devam et barı (XP göstergesi dahil) |

---

## ErrorFallback (`components/ErrorFallback.tsx`)

**Rol:** Uygulama çökmelerinde güvenli hata ekranı  
**Props:** `error: Error`, `resetError: () => void`

### Alt Bileşenler

| Dosya | Sorumluluk |
|-------|-----------|
| `error/errorFallbackStyles.ts` | StyleSheet tanımları |
| `error/ErrorDetailsModal.tsx` | DEV modunda hata detaylarını gösteren modal |

---

## Leaderboard Bileşenleri (`components/leaderboard/`)

| Dosya | Sorumluluk |
|-------|-----------|
| `leaderboardHelpers.ts` | `getRankColor()`, `getRankName()`, `MEDAL_CONFIG` |
| `leaderboardStyles.ts` | Tüm StyleSheet tanımları |
| `LeaderRow.tsx` | Tek oyuncu satırı (medal/pozisyon, avatar, rütbe, XP) |
| `PodiumCard.tsx` | Top-3 podyum kartı (FlatList başlığı olarak kullanılır) |
| `LeaderboardStates.tsx` | `LoadingState`, `ErrorState`, `EmptyState` bileşenleri |

---

## Home Bileşenleri (`components/home/`)

| Dosya | Sorumluluk |
|-------|-----------|
| `homeStyles.ts` | Tüm StyleSheet tanımları |
| `missionHelpers.ts` | `diffColor()`, `diffLabel()`, `TYPE_ICONS` |
| `PulseDot.tsx` | Withered nefes alan animasyonlu nokta (section header) |
| `StreakBonusToast.tsx` | Günlük seri bonusu floating toast (+XP bildirimi) |
| `StreakCard.tsx` | Günlük seri durumu kartı (devam ediyor / uyarı / başlat) |
| `XPProgressCard.tsx` | Rütbe adı + XPBar + sonraki rütbeye uzaklık |
| `StatsRow.tsx` | 3 istatistik kutusu (çözülen / doğruluk / XP) |
| `DailyMissionCard.tsx` | Günün öne çıkan görevi (2x XP badge, Başla butonu) |
| `ActiveMissionsList.tsx` | Yatay kaydırmalı aktif vakalar + "Tümü" butonu |

---

## Paylaşılan Bileşenler

| Dosya | Sorumluluk |
|-------|-----------|
| `RankBadge.tsx` | Rütbe rozeti (sm/md/lg boyutları) |
| `XPBar.tsx` | XP ilerleme çubuğu |

---

## Hook'lar (`hooks/`)

| Hook | Sorumluluk |
|------|-----------|
| `useColors.ts` | Tema renkleri (`colors.primary`, `colors.card`, vb.) |
| `useResponsive.ts` | `fs()`, `sp()`, `hp`, `maxW`, `isTablet` |
| `useLeaderboard.ts` | Liderlik tablosu veri çekme + retry mantığı |
