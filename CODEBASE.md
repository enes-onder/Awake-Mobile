# Kod Tabanı Haritası — Doğruluk Dedektifi

Bu belge projedeki **her klasör ve dosyanın** ne işe yaradığını açıklar. Detaylı özellik belgelemeleri için `docs/` klasörüne bak.

---

## Hızlı Referans

| Konu | Detaylı Belge |
|---|---|
| Auth sistemi (anonim kod adı tabanlı) | [`docs/AUTH.md`](docs/AUTH.md) |
| Responsive tasarım ve `useResponsive` hook | [`docs/RESPONSIVE.md`](docs/RESPONSIVE.md) |
| XP, rütbe, rozet, streak oyun sistemleri | [`docs/GAME_MECHANICS.md`](docs/GAME_MECHANICS.md) |
| PostgreSQL şeması, tablolar, seed data | [`docs/DATABASE.md`](docs/DATABASE.md) |
| Her ekranın detaylı açıklaması | [`docs/SCREENS.md`](docs/SCREENS.md) |
| Her bileşenin props/davranış açıklaması | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) |
| UserContext ve ContentContext | [`docs/CONTEXTS.md`](docs/CONTEXTS.md) |

---

## Proje Kökü

```
/
├── artifacts/           ← Çalışan uygulamalar
│   ├── mobile/          ← Expo React Native uygulaması
│   └── api-server/      ← Express REST API
├── lib/                 ← Paylaşılan kütüphaneler (db, api-spec, api-zod)
├── docs/                ← Özellik belgeleme klasörü
├── scripts/             ← Geliştirici araçları (post-merge.sh)
├── package.json         ← Kök proje tanımı
├── pnpm-workspace.yaml  ← Hangi klasörlerin paket olduğu
└── tsconfig.json        ← TypeScript kök ayarları
```

---

## `/lib/db/` — Veritabanı Şeması

Drizzle ORM ile tanımlanmış **Replit PostgreSQL** şeması. `DATABASE_URL` ortam değişkeninden bağlantı bilgisini okur.

- `pnpm --filter @workspace/db run push` → şemayı veritabanına uygular
- `pnpm --filter @workspace/db run seed` → 8 vaka, 6 ders, 3 simülasyon yükler

→ Detaylar: [`docs/DATABASE.md`](docs/DATABASE.md)

---

## `/artifacts/mobile/` — Ana Mobil Uygulama

### `app.json` — Expo Yapılandırması

| Ayar | Değer | Açıklama |
|---|---|---|
| `name` | "Doğruluk Dedektifi" | Uygulama adı |
| `orientation` | portrait | Sadece dikey mod |
| `newArchEnabled` | true | React Native yeni mimarisi |
| `experiments.reactCompiler` | true | React Compiler (beta) |
| `experiments.typedRoutes` | true | TypeScript route tipleri |

---

### `app/` — Ekranlar (Expo Router)

> Dosya adı = ekran yolu. Örnek: `app/onboarding.tsx` → `/onboarding` URL'si

| Dosya | Route | Açıklama |
|---|---|---|
| `_layout.tsx` | — | Kök düzen; fontlar, provider'lar, NavController |
| `onboarding.tsx` | `/onboarding` | Orkestratör: `intro` → `name` adım yönlendirici |
| `leaderboard.tsx` | `/leaderboard` | Liderlik tablosu (stack ekranı) |
| `edit-profile.tsx` | `/edit-profile` | Profil düzenleme (sağdan kayan modal) |
| `+not-found.tsx` | `/*` | 404 sayfası |
| `(tabs)/_layout.tsx` | — | Sekme çubuğu yapılandırması |
| `(tabs)/index.tsx` | `/` | Karargah — ana dashboard |
| `(tabs)/lab.tsx` | `/lab` | Haber Lab (vaka + simülasyon) |
| `(tabs)/academy.tsx` | `/academy` | Akademi (dersler + rozetler) |
| `(tabs)/profile.tsx` | `/profile` | Kullanıcı profili |

**`_layout.tsx` — NavController yönlendirme kuralları:**
- `username` yok → `/onboarding`
- `username` var + onboarding'deyse → `/(tabs)`

**`onboarding.tsx`** — İnce orkestratör (~25 satır). İki adım:
1. `intro` → `IntroSlides` (3 kaydırmalı tanıtım slaydı)
2. `name` → `QuickEntryScreen` (kod adı girişi + mock sosyal butonlar)

→ Ekran detayları: [`docs/SCREENS.md`](docs/SCREENS.md)
→ Auth akışı: [`docs/AUTH.md`](docs/AUTH.md)

---

### `components/` — UI Bileşenleri

**Mimari:** Her bileşenin tek sorumluluğu var. Ekran bileşenleri iş mantığı barındırmaz; sadece render eder.

#### `onboarding/` — Onboarding Adım Bileşenleri

| Dosya | Kısaca |
|---|---|
| `QuickEntryScreen.tsx` | Ana giriş ekranı: kod adı input + "Hızlı Giriş" butonu + mock Google/Apple butonlar. Koyu siber tema (#070B14). |
| `IntroSlides.tsx` | 3 kaydırmalı tanıtım slaydı. FlatList + pagingEnabled. "Atla" ve "Devam Et/Göreve Başla" butonları. |
| `NameStep.tsx` | Eski bağımsız kod adı adımı (artık QuickEntryScreen içine entegre). |
| `AuthScreen.tsx` | Eski email/şifre ekranı (artık onboarding akışında kullanılmıyor). |
| `OnboardingLogo.tsx` | GlowRing + kalkan ikonu — paylaşımlı logo bileşeni |
| `GlowRing.tsx` | Nabız atan animasyonlu ışık halkası (Reanimated) |
| `ErrorBox.tsx` | Hata/başarı mesaj kutusu |
| `BackButton.tsx` | Sol üst ok butonu |
| `styles.ts` | Tüm onboarding ekranlarının paylaşımlı StyleSheet'i |
| `types.ts` | `Step`, `AuthProvider`, `ProviderItem` TypeScript tipleri |

#### `profile/` — Profil Ekranı Bileşenleri

| Dosya | Kısaca |
|---|---|
| `ProfileInitials.tsx` | İsmin baş harflerinden oluşan daire avatar |
| `ProfileHeader.tsx` | "Profil" başlığı + sağda "Düzenle" butonu |
| `HeroCard.tsx` | Avatar, isim, bio, favori konu, `RankBadge`, `XPBar`, streak satırı |
| `AnonBanner.tsx` | **Misafir hesabı uyarısı** — `isGuestMode === true` olduğunda profil ekranında gösterilir. Alert ile "yakında Google/Apple" mesajı verir. |
| `StatsGrid.tsx` | 4'lü istatistik kartları (vaka, doğruluk, XP, rozet) |
| `RankPath.tsx` | 5 rütkenin yatay bağlantılı ilerleme haritası |
| `CertCard.tsx` | 800 XP eşiği ilerleme çubuğu |
| `SignOutButton.tsx` | Çıkış yapma butonu |
| `styles.ts` | Paylaşımlı StyleSheet |

#### `edit-profile/` — Profil Düzenleme Bileşenleri

| Dosya | Kısaca |
|---|---|
| `SectionHeader.tsx` | "KOD ADI", "BİO" gibi küçük bölüm etiketleri |
| `EditProfileTopBar.tsx` | Geri + başlık + Kaydet butonu |
| `UsernameField.tsx` | Input + kilit rozeti + cooldown uyarı satırı |
| `BioField.tsx` | Multiline textarea + karakter sayacı |
| `TopicsPicker.tsx` | 8 konuluk chip grid seçici |
| `InfoCard.tsx` | "Değişiklikler hemen kaydedilir" bilgi notu |
| `UsernameWarningModal.tsx` | 30 günlük cooldown modal'ı |
| `styles.ts` | Paylaşımlı StyleSheet |

#### `lab/` — Haber Lab Bileşenleri

| Dosya | Kısaca |
|---|---|
| `ActiveMissionView.tsx` | Aktif görev görünümü: header + SwipeCard alanı. `topPadding` ve `bottomInset` alır. |
| `MissionResultView.tsx` | Sonuç ekranı: başarı/başarısızlık göstergesi + XP + açıklama + aksiyon butonları |
| `VakalarTab.tsx` | Bekleyen ve tamamlanan görev listesi |
| `SimulasyonTab.tsx` | Simülasyon kart listesi |
| `LabTabButton.tsx` | "Vaka Analizi" / "Simülasyon" sekme butonu |
| `labStyles.ts` | Tüm lab bileşenlerinin paylaşımlı StyleSheet'i |

#### `swipe/` — SwipeCard Alt Bileşenleri

| Dosya | Kısaca |
|---|---|
| `useSwipeGesture.ts` | PanResponder tabanlı kaydırma mantığı + XP ceza animasyonu |
| `SwipeOverlays.tsx` | "DOĞRU" / "YANLIŞ" kaydırma overlay'leri + kilit damgası |
| `PostContent.tsx` | Platform çubuğu, gönderi başlığı, metin, istatistikler |
| `CluesArea.tsx` | İpucu listesi |
| `VerdictButtons.tsx` | "İpucu Al" + "DOĞRU/YANLIŞ" buton satırı |
| `swipeCardStyles.ts` | StyleSheet |
| `swipeConstants.ts` | `PLATFORM_ICONS`, `SWIPE_THRESHOLD` sabitleri |

#### `leaderboard/` — Liderlik Tablosu Bileşenleri

| Dosya | Kısaca |
|---|---|
| `PodiumCard.tsx` | İlk 3 oyuncunun podyum görünümü (FlatList header) |
| `LeaderRow.tsx` | Tek bir oyuncu satırı (animasyonlu giriş) |
| `LeaderboardStates.tsx` | `LoadingState`, `ErrorState`, `EmptyState` UI'ları |
| `leaderboardHelpers.ts` | `getRankColor()`, `getRankName()`, `MEDAL_CONFIG` |
| `leaderboardStyles.ts` | StyleSheet |

#### `home/` — Karargah Bileşenleri

| Dosya | Kısaca |
|---|---|
| `StreakCard.tsx` | Günlük seri kartı (seri sayısı, animasyon) |
| `XPProgressCard.tsx` | XP ilerleme çubuğu + rütbe bilgisi |
| `StatsRow.tsx` | 3 istatistik kutusu (vaka / doğruluk / XP) |
| `DailyMissionCard.tsx` | Günlük öne çıkan görev (2× XP rozeti) |
| `ActiveMissionsList.tsx` | Yatay kaydırmalı aktif vakalar listesi |
| `StreakBonusToast.tsx` | Giriş streak bonusu toast bildirimi |
| `PulseDot.tsx` | Animasyonlu nabız noktası |
| `missionHelpers.ts` | `diffColor()`, `diffLabel()`, `TYPE_ICONS` |
| `homeStyles.ts` | StyleSheet |

#### `simulation/` — SimulationPlayer Alt Bileşenleri

| Dosya | Kısaca |
|---|---|
| `NarrativeStep.tsx` | Anlatı adımı kartı |
| `ChoiceStep.tsx` | Seçim adımı + açıklama |
| `AnimatedChoiceButton.tsx` | Animasyonlu seçenek butonu |
| `SimTopBar.tsx` | Kapat butonu + ilerleme çubuğu |
| `SimContinueBar.tsx` | "Devam et" butonu barı |
| `SimDoneScreen.tsx` | Tamamlanma ekranı |
| `simStyles.ts` | StyleSheet |

#### Paylaşımlı Bileşenler

| Dosya | Kısaca |
|---|---|
| `SwipeCard.tsx` | Ana SwipeCard orkestratörü — `useSwipeGesture` + alt bileşenler |
| `SimulationPlayer.tsx` | Ana SimulationPlayer orkestratörü — adım adım senaryo |
| `CelebrationOverlay.tsx` | Doğru/yanlış toast animasyonu (safe-area uyumlu, Reanimated) |
| `XPFloater.tsx` | Uçan "+N XP" balonu animasyonu |
| `XPBar.tsx` | Rütbe XP ilerleme çubuğu |
| `RankBadge.tsx` | Rütbe ikon+isim rozeti |
| `BadgeCard.tsx` | Rozet kartı (kazanılmış/kilitli) |
| `MissionCard.tsx` | Görev listesi kartı |
| `ErrorBoundary.tsx` | Global hata yakalayıcı (class component) |
| `ErrorFallback.tsx` | Hata ekranı UI'ı |

→ Bileşen detayları: [`docs/COMPONENTS.md`](docs/COMPONENTS.md)

---

### `context/` — Uygulama Durumu

| Dosya | Kısaca |
|---|---|
| `UserContext.tsx` | Kullanıcı adı tabanlı yerel oturum (AsyncStorage). XP, rütbe, streak, rozetler, `isGuestMode` (misafir bayrağı). `setUsername()`, `earnXP()`, `signOut()` |
| `ContentContext.tsx` | REST API'den içerik çekme (vakalar, dersler, simülasyonlar) + XP kilitleme mantığı + offline fallback |

→ Detaylar: [`docs/CONTEXTS.md`](docs/CONTEXTS.md)

---

### `hooks/` — React Hook'ları

**Mimari:** Hook'lar iş mantığını barındırır; bileşenler sadece hook'tan gelen veriyi render eder.

| Hook | Kısaca |
|---|---|
| `useOnboardingAuth.ts` | Onboarding state + `handleStart()` (kod adı kaydetme) |
| `useLabState.ts` | Lab ekranının tüm state'i (aktif görev, sonuç, kutlama, XP floater, padding hesabı) |
| `useLeaderboard.ts` | Liderlik tablosu veri çekme — API başarısız olursa 8 mock siber-ajan gösterir |
| `useProfile.ts` | Profil ekranı için `topPadding`, `rankIdx`, `statItems` hesabı |
| `useEditProfile.ts` | Profil düzenleme form state + kaydetme mantığı |
| `useColors.ts` | Tema renkleri (her zaman dark tema döndürür) |
| `useResponsive.ts` | `fs()`, `sp()`, `hp`, `maxW`, `isTablet` — ekran boyutuna göre ölçekleme |

---

### `data/` — Offline Yedek İçerik

| Dosya | İçerik |
|---|---|
| `missions.ts` | `Mission` tipi + 8 örnek vaka (API kapalıysa fallback) |
| `lessons.ts` | 6 ders (paragraflar + quiz soruları) |
| `simulations.ts` | `Simulation`, `SimStep`, `SimChoice` tipleri + 3 simülasyon |

`ContentContext` API'den veri çekemezse bu dosyaları kullanır (offline öncelikli mimari).

---

### `lib/api.ts` — API İstemcisi

REST API ile iletişim kurar. Temel fonksiyonlar:

```typescript
api.getMissions()        → Mission[]
api.getLessons()         → Lesson[]
api.getSimulations()     → Simulation[]
api.getLeaderboard(50)   → LeaderboardEntry[]
api.syncProfile({...})   → liderlik tablosu için profil senkronizasyonu
```

---

### `constants/colors.ts` — Renk Paleti

| Renk | Değer | Kullanım |
|---|---|---|
| `background` | `#070B14` | Sayfa arka planı |
| `card` | `#0F1623` | Kart arka planı |
| `primary` | `#2B7FFF` | Ana buton, vurgu (neon mavi) |
| `foreground` | `#E8EDF5` | Ana metin |
| `mutedForeground` | `#5C6B82` | İkincil metin |
| `border` | `#1B2A42` | Kenarlık |
| `success` / `real` | `#00C851` | Doğru haber, başarı |
| `fake` / `destructive` | `#FF3B30` | Sahte haber, hata |
| `warning` | `#FF9500` | Uyarı, XP rengi (turuncu) |
| `accent` | `#00D4FF` | Aksan vurgu (cyan) |

---

## `/artifacts/api-server/` — REST API Sunucusu

Express v5 tabanlı API. Port 3001'de çalışır.

| Dosya | Açıklama |
|---|---|
| `src/index.ts` | Sunucu başlatma, PORT doğrulaması, port dinleme |
| `src/app.ts` | Middleware sırası: pino-http → CORS → JSON parser → `/api` route'ları |
| `src/routes/index.ts` | Sub-router'ları `/api` altında birleştirir |
| `src/routes/health.ts` | `GET /api/healthz` → `{ status: "ok" }` (Zod doğrulamalı) |
| `src/routes/content.ts` | `GET /api/missions`, `/api/lessons`, `/api/simulations` — isActive=true filtreli, orderIndex sıralı |
| `src/routes/profiles.ts` | `POST /api/profiles/upsert` (kullanıcı upsert) + `GET /api/leaderboard` (XP sıralaması) |
| `src/lib/logger.ts` | Pino logger — geliştirmede renkli, production'da JSON; hassas başlıklar redact edilir |
| `build.mjs` | esbuild ile TypeScript → ESM bundle (`dist/index.mjs`); CJS uyumluluk banner'ı dahil |

---

## Animasyon Kütüphaneleri

- **React Native `Animated`** — SwipeCard pan/sürükleme animasyonları
- **`react-native-reanimated`** — CelebrationOverlay, XPFloater, XPBar, seçenek buton girişleri
- **Expo Haptics** — Dokunsal geri bildirim (web hariç)

---

## Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | Evet (API için) | Replit PostgreSQL bağlantı dizesi (Replit Secrets'ta tanımlı) |
| `PORT` | Hayır | API portu (varsayılan 3001) |

> ⚠️ **`EXPO_PUBLIC_API_URL` tanımlanmamalıdır.**
> Bu değişken Expo bundle'ına gömülür. Tanımlı olursa tarayıcı `localhost:3001`'e istek atar — bu kullanıcının kendi makinesine gider, Replit container'ına değil.
> Değişken boş bırakıldığında `api.ts` relative URL (`/api/...`) kullanır ve web-proxy.js isteği doğru porta yönlendirir.

---

## Port ve Proxy Mimarisi

```
Tarayıcı (Replit preview)
      ↓ port 5000
artifacts/mobile/server/web-proxy.js
      ├── /api/* istekleri  → localhost:3001 (Express API sunucusu)
      └── diğer istekler    → localhost:18115 (Expo Metro bundler)

WebSocket (HMR)            → Metro'ya doğrudan TCP tüneli
```

Expo bundle relative URL kullanır (`/api/missions`).
Tarayıcı aynı origin'e istek atar → CORS sorunu yok.

---

## Veri Akışı

```
Uygulama açılır
      ↓
_layout.tsx → UserContext: AsyncStorage'dan kullanıcı verisi yükle
      ↓
NavController:
  username yok? → /onboarding (intro slaytlar → QuickEntry → kod adı yaz → başla)
  username var? → /(tabs)
      ↓
ContentContext → API'den içerik çek (relative URL → proxy → Express)
  GET /api/missions, /api/lessons, /api/simulations
  Başarılı → API verisini kullan
  Başarısız → data/*.ts yerel yedekler (offline fallback)
      ↓
Kullanıcı oynar (lab, academy)
      ↓
UserContext.completeMission() / earnXP()
      ↓
AsyncStorage'a kaydet + api.syncProfile() → POST /api/profiles/upsert
      ↓
Ekran güncellenir
```
