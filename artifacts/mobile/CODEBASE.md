# Doğruluk Dedektifi — Codebase Rehberi

## Mimari

**Monorepo** (pnpm workspaces):
- `artifacts/mobile/` — Expo SDK 54 React Native uygulaması
- `artifacts/api-server/` — Express v5 REST API (port 3001)
- `lib/db/` — Drizzle ORM + PostgreSQL

## Klasör Yapısı (`artifacts/mobile/`)

```
app/
  (tabs)/
    index.tsx          # Karargah ekranı (ana sayfa) — orchestrator
    lab.tsx            # Görev Laboratuvarı ekranı
    learn.tsx          # Öğren ekranı
    profile.tsx        # Profil ekranı
  leaderboard.tsx      # Liderlik Tablosu ekranı — orchestrator
  _layout.tsx          # Root layout
  onboarding.tsx       # İlk açılış / kullanıcı adı alma
  
components/
  leaderboard/         # Liderlik Tablosu alt bileşenleri
    leaderboardHelpers.ts   # getRankColor, getRankName, MEDAL_CONFIG
    leaderboardStyles.ts    # StyleSheet
    LeaderRow.tsx           # Tek satır bileşeni
    PodiumCard.tsx          # Top-3 podyum kartı
    LeaderboardStates.tsx   # Loading / Error / Empty durumları
  home/                # Karargah ekranı alt bileşenleri
    homeStyles.ts           # StyleSheet
    missionHelpers.ts       # diffColor, diffLabel, TYPE_ICONS
    PulseDot.tsx            # Animasyonlu nokta
    StreakBonusToast.tsx     # Üst toast bildirimi
    StreakCard.tsx          # Günlük seri kartı
    XPProgressCard.tsx      # XP ilerleme kartı
    StatsRow.tsx            # 3 stat kutusu (çözüldü / doğruluk / XP)
    DailyMissionCard.tsx    # Günlük görev öne çıkan kartı
    ActiveMissionsList.tsx  # Yatay kaydırmalı aktif vakalar listesi
  swipe/               # SwipeCard alt bileşenleri
    swipeConstants.ts       # PLATFORM_ICONS, PLATFORM_COLORS, SWIPE_THRESHOLD
    swipeCardStyles.ts      # StyleSheet
    useSwipeGesture.ts      # PanResponder + XP ceza animasyonu hook'u
    SwipeOverlays.tsx       # Sürükleme overlay + kilit damgası
    PostContent.tsx         # Platform barı, gönderi başlığı, metin, istatistikler
    CluesArea.tsx           # İpucu listesi
    VerdictButtons.tsx      # İpucu butonu + DOĞRU/YANLIŞ butonları
  simulation/          # SimulationPlayer alt bileşenleri
    simStyles.ts            # StyleSheet
    AnimatedChoiceButton.tsx# Animasyonlu seçenek butonu
    SimTopBar.tsx           # Kapat + ilerleme çubuğu
    NarrativeStep.tsx       # Anlatı adımı kartı
    ChoiceStep.tsx          # Seçim adımı + açıklama
    SimDoneScreen.tsx       # Tamamlanma ekranı (alternatif görünüm)
    SimContinueBar.tsx      # Devam et butonu barı
  error/               # ErrorFallback alt bileşenleri
    errorFallbackStyles.ts  # StyleSheet
    ErrorDetailsModal.tsx   # DEV hata detay modalı
  SwipeCard.tsx        # Ana SwipeCard — orchestrator (~65 satır)
  SimulationPlayer.tsx # Ana SimulationPlayer — orchestrator (~170 satır)
  ErrorFallback.tsx    # Ana ErrorFallback — orchestrator (~80 satır)
  RankBadge.tsx        # Rütbe rozeti
  XPBar.tsx            # XP ilerleme çubuğu
  
context/
  UserContext.tsx      # Kullanıcı durumu (XP, rütbe, seri, tamamlanan görevler)
  ContentContext.tsx   # Görev / ders / simülasyon veri yükleme
  ThemeContext.tsx     # Açık/koyu tema
  
hooks/
  useColors.ts         # Tema renkleri
  useResponsive.ts     # fs(), sp(), hp, maxW, isTablet
  useLeaderboard.ts    # Liderlik tablosu veri çekme hook'u
  
data/
  missions.ts          # Mission type + statik veri (API yokken fallback)
  simulations.ts       # Simulation, SimStep, SimChoice tipleri + SIMULATIONS
  lessons.ts           # Ders verileri
  
lib/
  api.ts               # API istemcisi (LeaderboardEntry dahil)
```

## Alias İmportları

Tüm dosyalar `@/` prefix'i kullanır (ör: `@/hooks/useColors`, `@/data/missions`).

## Önemli Tipler

| Tip | Kaynak |
|-----|--------|
| `Mission` | `@/data/missions` |
| `Simulation`, `SimStep`, `SimChoice` | `@/data/simulations` |
| `Rank`, `RANKS` | `@/context/UserContext` |
| `LeaderboardEntry` | `@/lib/api` |

## Animasyon Kütüphaneleri

- **React Native `Animated`** — SwipeCard pan animasyonları
- **`react-native-reanimated`** — XP ceza, streak, XP bar, seçenek buton girişleri
- **Expo Haptics** — Dokunsal geri bildirim (web hariç)
