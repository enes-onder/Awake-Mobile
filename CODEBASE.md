# Kod Tabanı Haritası — Doğruluk Dedektifi

Bu belge projedeki **her klasör ve dosyanın** ne işe yaradığını açıklar. Detaylı özellik belgelemeleri için `docs/` klasörüne bak.

---

## Hızlı Referans

| Konu | Detaylı Belge |
|---|---|
| Auth sistemi (Supabase, OAuth, anonim giriş) | [`docs/AUTH.md`](docs/AUTH.md) |
| Responsive tasarım ve `useResponsive` hook | [`docs/RESPONSIVE.md`](docs/RESPONSIVE.md) |
| XP, rütbe, rozet, streak oyun sistemleri | [`docs/GAME_MECHANICS.md`](docs/GAME_MECHANICS.md) |
| Supabase şeması, tablolar, seed data | [`docs/DATABASE.md`](docs/DATABASE.md) |
| Her ekranın detaylı açıklaması | [`docs/SCREENS.md`](docs/SCREENS.md) |
| Her bileşenin props/davranış açıklaması | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) |
| UserContext ve ContentContext | [`docs/CONTEXTS.md`](docs/CONTEXTS.md) |

---

## Proje Kökü

```
/
├── artifacts/           ← Çalışan uygulamalar
├── lib/                 ← Paylaşılan kütüphaneler
├── supabase/            ← Veritabanı kurulum dosyası
├── docs/                ← Özellik belgeleme klasörü
├── scripts/             ← Geliştirici araçları
├── package.json         ← Kök proje tanımı
├── pnpm-workspace.yaml  ← Hangi klasörlerin paket olduğu
├── tsconfig.json        ← TypeScript kök ayarları
├── tsconfig.base.json   ← Ortak TypeScript temel ayarları
└── .gitignore
```

### `/package.json`
- `pnpm install`'ı npm/yarn için engeller (sadece pnpm)
- `pnpm run build` → tüm paketleri derler
- `pnpm run typecheck` → tip hatalarını kontrol eder

### `/pnpm-workspace.yaml`
pnpm'e hangi klasörlerin ayrı paket olduğunu söyler. `artifacts/mobile`, `artifacts/api-server`, `lib/db` vb. her biri ayrı paket.

### `/tsconfig.base.json` ve `/tsconfig.json`
- `tsconfig.base.json` → strict mod, module çözümü gibi temel ayarlar
- `tsconfig.json` → `lib/` paketleri arasındaki proje referansları

---

## `/supabase/`

### `schema_and_seed.sql`
Supabase veritabanını sıfırdan kuran tek dosya. Tablo oluşturma, RLS politikaları ve başlangıç verisi (8 vaka, 6 ders, 3 simülasyon) içerir.

→ Detaylar: [`docs/DATABASE.md`](docs/DATABASE.md)

---

## `/artifacts/mobile/` — Ana Mobil Uygulama

---

### `app.json` — Expo Yapılandırması

| Ayar | Değer | Açıklama |
|---|---|---|
| `name` | "Doğruluk Dedektifi" | Uygulama adı |
| `orientation` | portrait | Sadece dikey mod |
| `newArchEnabled` | true | React Native yeni mimarisi |
| `experiments.reactCompiler` | true | React Compiler (beta) |
| `experiments.typedRoutes` | true | TypeScript route tipleri |
| `ios.supportsTablet` | false | iPad desteği kapalı |

---

### `app/` — Ekranlar (Expo Router)

> Dosya adı = ekran yolu. Örnek: `app/onboarding.tsx` → `/onboarding` URL'si

| Dosya | Route | Açıklama |
|---|---|---|
| `_layout.tsx` | — | Kök düzen; fontlar, provider'lar, NavController, DeepLinkHandler |
| `onboarding.tsx` | `/onboarding` | Giriş ve kod adı seçimi (5 adımlı akış) |
| `edit-profile.tsx` | `/edit-profile` | Profil düzenleme (sağdan kayan modal) |
| `+not-found.tsx` | `/*` | 404 sayfası |
| `(tabs)/_layout.tsx` | — | Sekme çubuğu (LiquidGlass veya Klasik) |
| `(tabs)/index.tsx` | `/` | Karargah — ana dashboard |
| `(tabs)/lab.tsx` | `/lab` | Haber Lab (vaka + simülasyon) |
| `(tabs)/academy.tsx` | `/academy` | Akademi (dersler + rozetler) |
| `(tabs)/profile.tsx` | `/profile` | Kullanıcı profili |

**Önemli dosyalar:**

**`_layout.tsx`** — NavController yönlendirme kuralları:
- `authUser` yok → `/onboarding`
- `authUser` var + `username` boş → `/onboarding`
- `authUser` + `username` + anonim değil + onboarding'deyse → `/(tabs)`

**`onboarding.tsx`** — İnce orkestratör (~80 satır). `useOnboardingAuth` hook'undan gelen `auth.step` değerine göre ilgili adım bileşenini (`AuthStep`, `EmailStep`, `PhoneStep`, `OtpStep`, `NameStep`) render eder. İş mantığı hook'ta, UI bileşenlerde yaşar.

**`edit-profile.tsx`** — İnce orkestratör (~65 satır). `useEditProfile` hook'undan gelen state'i alt bileşenlere (`EditProfileTopBar`, `UsernameField`, `BioField`, `TopicsPicker`, `InfoCard`, `UsernameWarningModal`) dağıtır.

→ Ekran detayları: [`docs/SCREENS.md`](docs/SCREENS.md)
→ Auth akışı: [`docs/AUTH.md`](docs/AUTH.md)

---

### `components/` — UI Bileşenleri

**Mimari:** Her bileşenin tek sorumluluğu var. Ekran bileşenleri iş mantığı barındırmaz; sadece render eder.

#### `onboarding/` — Onboarding Adım Bileşenleri

| Dosya | Kısaca |
|---|---|
| `types.ts` | `Step`, `AuthProvider`, `ProviderItem` tipleri |
| `styles.ts` | Tüm onboarding ekranlarının paylaşımlı StyleSheet'i |
| `GlowRing.tsx` | Kalkan ikonunun etrafındaki nabız animasyonlu halka |
| `OnboardingLogo.tsx` | GlowRing + kalkan ikonu — tüm adımlarda paylaşımlı |
| `ErrorBox.tsx` | Hata/başarı mesaj kutusu (✅ öneki başarıyı ayırt eder) |
| `BackButton.tsx` | Sol üst ok butonu |
| `AuthStep.tsx` | Provider seçim ekranı (Google, Apple, e-posta, telefon, misafir) |
| `EmailStep.tsx` | E-posta giriş/kayıt formu (şifre ve magic link modları) |
| `PhoneStep.tsx` | Telefon numarası giriş formu (+90 otomatik ön eki) |
| `OtpStep.tsx` | 6 haneli SMS kodu doğrulama |
| `NameStep.tsx` | Kod adı seçimi + özellik etiketleri |

#### `edit-profile/` — Profil Düzenleme Bileşenleri

| Dosya | Kısaca |
|---|---|
| `styles.ts` | Tüm profil düzenleme bileşenlerinin paylaşımlı StyleSheet'i |
| `SectionHeader.tsx` | "KOD ADI", "BİO" gibi bölüm başlıkları |
| `EditProfileTopBar.tsx` | Geri butonu + sayfa başlığı + Kaydet butonu |
| `UsernameField.tsx` | Kullanıcı adı inputu + kilit rozeti + cooldown uyarısı |
| `BioField.tsx` | Çok satırlı bio textarea + 80 karakter sayacı |
| `TopicsPicker.tsx` | 8 konuluk chip grid seçici (TOPICS sabiti burada) |
| `InfoCard.tsx` | "Değişiklikler hemen kaydedilir" bilgi kartı |
| `UsernameWarningModal.tsx` | 30 günlük cooldown uyarı modal'ı |

#### `profile/` — Profil Ekranı Bileşenleri

| Dosya | Kısaca |
|---|---|
| `styles.ts` | Tüm profil bileşenlerinin paylaşımlı StyleSheet'i |
| `ProfileInitials.tsx` | Baş harflerden oluşan avatar dairesi |
| `ProfileHeader.tsx` | "Profil" başlığı + "Düzenle" butonu |
| `HeroCard.tsx` | Avatar, isim, bio, konu pill, RankBadge, XPBar, streak satırı |
| `AnonBanner.tsx` | Misafir hesabı uyarı banner'ı (onboarding'e yönlendirir) |
| `StatsGrid.tsx` | 4'lü istatistik kartları (vaka, doğruluk, XP, rozet) |
| `RankPath.tsx` | 5 rütkenin yatay bağlantılı ilerleme haritası |
| `CertCard.tsx` | Dijital sertifika kartı (800 XP eşiği ilerleme çubuğu) |
| `SignOutButton.tsx` | Çıkış yapma butonu |

#### Paylaşımlı Bileşenler

| Dosya | Kısaca |
|---|---|
| `SwipeCard.tsx` | Tinder-stili haber kartı; PanGesture ile swipe |
| `SimulationPlayer.tsx` | Adım adım senaryo oynatıcı |
| `CelebrationOverlay.tsx` | Doğru/yanlış tam ekran animasyonu (1.5 sn) |
| `XPFloater.tsx` | Uçan "+N XP" baloncuğu animasyonu |
| `XPBar.tsx` | Rütke ilerleme çubuğu |
| `RankBadge.tsx` | Rütke ikon+isim rozeti (sm / md) |
| `BadgeCard.tsx` | Rozet kartı (kazanılmış/kilitli) |
| `MissionCard.tsx` | Görev listesi kartı (normal / compact) |
| `ErrorBoundary.tsx` | Global hata yakalayıcı (class component) |
| `ErrorFallback.tsx` | Hata ekranı UI'ı |
| `KeyboardAwareScrollViewCompat.tsx` | Web/native klavye scroll adaptörü |

→ Bileşen detayları: [`docs/COMPONENTS.md`](docs/COMPONENTS.md)

---

### `context/` — Uygulama Durumu

| Dosya | Kısaca |
|---|---|
| `UserContext.tsx` | Auth (Supabase) + tüm oyun verisi (XP, rozet, streak vb.) + AsyncStorage |
| `ContentContext.tsx` | Supabase'den içerik çekme + XP kilitleme mantığı + offline fallback |

→ Detaylar: [`docs/CONTEXTS.md`](docs/CONTEXTS.md)

---

### `hooks/` — React Hook'ları

**Mimari:** Hook'lar iş mantığını barındırır; bileşenler sadece hook'tan gelen veriyi render eder. Hiçbir hook JSX döndürmez.

#### `useOnboardingAuth.ts` — Onboarding Auth Hook'u

Tüm onboarding state'ini ve Supabase auth işlemlerini kapsar. `app/onboarding.tsx` bunu tüketir.

```typescript
const auth = useOnboardingAuth();
// auth.step, auth.setStep
// auth.loading, auth.error, auth.clearError
// auth.handleProviderSelect, auth.handleEmailAuth
// auth.handleSendOTP, auth.handleVerifyOTP
// auth.handleAnonymousSignIn, auth.handleStart
// auth.emailInput, auth.passwordInput, auth.phoneInput, ...
```

#### `useProfile.ts` — Profil Ekranı Hook'u

Platform bazlı üst padding, aktif rütke indeksi ve istatistik veri listesini hesaplar. `app/(tabs)/profile.tsx` tarafından kullanılır.

```typescript
const { topPadding, rankIdx, statItems, user } = useProfile();
```

#### `useEditProfile.ts` — Profil Düzenleme Hook'u

Form state'i ve kaydetme mantığını kapsar. `app/edit-profile.tsx` bunu tüketir.

```typescript
const profile = useEditProfile();
// profile.usernameInput, profile.bioInput, profile.favoriteTopic
// profile.canChangeName, profile.daysLeft, profile.hasChanges
// profile.handleSave()
// profile.showUsernameWarning, profile.setShowUsernameWarning
```

#### `useResponsive.ts` — Responsive Tasarım Hook'u

Tüm ekranların ve bazı bileşenlerin kullandığı **paylaşımlı** hook. Ekran genişliğine göre ölçek, font boyutu, padding ve tablet kırılım noktası hesaplar.

```typescript
import { useResponsive } from "@/hooks/useResponsive";
const r = useResponsive();
// r.fs(18)   → ölçekli font
// r.hp       → yatay padding değeri
// r.maxW     → içerik max genişliği
// r.isTablet → genişlik ≥ 600px
// r.scale    → ham çarpan (0.9–1.25)
```

→ Detaylar: [`docs/RESPONSIVE.md`](docs/RESPONSIVE.md)

#### `useColors.ts` — Renk Sistemi

```typescript
export function useColors() {
  return { ...colors.dark, radius: colors.radius };
}
```
Her zaman karanlık tema döndürür.

---

### `constants/` — Sabitler

#### `colors.ts` — Renk Paleti

| Renk | Değer (Dark) | Kullanım |
|---|---|---|
| `background` | `#070B14` | Sayfa arka planı |
| `card` | `#0F1623` | Kart arka planı |
| `primary` | `#2B7FFF` | Ana buton, vurgu |
| `foreground` | `#E8EDF5` | Ana metin |
| `mutedForeground` | `#5C6B82` | İkincil metin |
| `border` | `#1B2A42` | Kenarlık |
| `success` / `real` | `#00C851` | Doğru haber, başarı |
| `fake` / `destructive` | `#FF3B30` | Sahte haber, hata |
| `warning` | `#FF9500` | Uyarı, XP rengi |
| `accent` | `#00D4FF` | Aksan vurgu |
| `radius` | `12` | Varsayılan köşe yuvarlama |

---

### `lib/`

#### `supabase.ts` — Supabase İstemcisi

```typescript
const SUPABASE_URL = "https://tojpdbexarwradtepwny.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

Oturumlar `AsyncStorage`'da kalıcı tutulur; uygulama kapatılsa da kullanıcı oturumda kalır.

---

### `data/` — Offline Yedek İçerik

| Dosya | İçerik |
|---|---|
| `missions.ts` | 8 vaka (m1–m8): başlık, zorluk, verdict, clues, explanation |
| `lessons.ts` | 6 ders (l1–l6): paragraflar + quiz soruları |
| `simulations.ts` | 3 simülasyon (s1–s3): narrative/choice adımlar |

`ContentContext` Supabase'e bağlanamazsa bu dosyaları kullanır.

---

### `server/serve.js` — Üretim Sunucusu

Deployment'ta kullanılan sıfır bağımlılıklı Node.js HTTP sunucusu. `static-build/` klasöründeki derlenmiş Expo uygulamasını sunar.

### `scripts/build.js` — Üretim Derleme Betiği

`pnpm --filter @workspace/mobile run build` komutu bu betiği çalıştırır. Metro bundler ile iOS + Android bundle'larını oluşturur, deployment domain'e göre URL'leri günceller, `static-build/` klasörüne çıktıları kaydeder.

---

## `/artifacts/api-server/` — REST API Sunucusu

Express.js tabanlı API sunucusu. Şu an yalnızca sağlık kontrolü var; ilerideki özellikler için altyapı hazır.

| Dosya | Açıklama |
|---|---|
| `src/index.ts` | Sunucu başlatma, `$PORT` dinleme |
| `src/app.ts` | Middleware (pino logger, CORS, JSON parser) + route bağlama |
| `src/routes/index.ts` | Sub-router'lar `/api` altında toplanır |
| `src/routes/health.ts` | `GET /api/healthz` → `{ status: "ok" }` |
| `src/lib/logger.ts` | Pino logger instance |

---

## `/lib/` — Paylaşılan Kütüphaneler

| Klasör | Açıklama |
|---|---|
| `lib/db/` | Drizzle ORM PostgreSQL şeması (`DATABASE_URL` okur) |
| `lib/api-spec/` | OpenAPI (YAML) endpoint belgesi |
| `lib/api-zod/` | `api-spec`'ten `orval` ile üretilen Zod şemaları |
| `lib/api-client-react/` | `api-spec`'ten `orval` ile üretilen React Query hook'ları |

---

## `/scripts/`

### `post-merge.sh`
Bir branch merge'inden sonra otomatik çalışır. `pnpm install` ve gerekli kurulum adımlarını yürütür.

---

## `.gitignore` — Önemli İstisnalar

- `node_modules/` — kurulum dosyaları (çok büyük)
- `.env` — gizli anahtarlar (asla yüklenmemeli!)
- `static-build/` — derleme çıktısı
- `.expo/` — Expo geçici dosyaları

---

## Ortam Değişkenleri

| Dosya | Değişken | Zorunlu | Açıklama |
|---|---|---|---|
| `artifacts/mobile/.env` | `EXPO_PUBLIC_SUPABASE_URL` | Hayır* | Supabase URL |
| `artifacts/mobile/.env` | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Hayır* | Supabase anonim anahtar |
| `artifacts/api-server/.env` | `DATABASE_URL` | API için evet | PostgreSQL bağlantı dizesi |
| `artifacts/api-server/.env` | `PORT` | Hayır | API portu (varsayılan 8080) |

*Olmadan uygulama çalışır ama yerel yedek verileri kullanır.

---

## Veri Akışı

```
Uygulama açılır
      ↓
_layout.tsx → UserContext init:
  AsyncStorage'dan oyun verisi yükle +
  Supabase'den mevcut oturumu kontrol et
      ↓
NavController tetiklenir:
  authUser yok? → /onboarding
  username boş? → /onboarding
  her şey tamam? → /(tabs)
      ↓
ContentContext → Supabase'den içerik çek
  Başarılı → Supabase verileri kullan
  Başarısız → data/*.ts yerel yedekler
      ↓
Kullanıcı oynar (lab, academy)
      ↓
UserContext.completeMission() / earnXP()
      ↓
AsyncStorage'a kaydet → Ekran güncellenir
```
