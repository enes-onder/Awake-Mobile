# 🔍 Doğruluk Dedektifi

> Dezenformasyona karşı silahlan. Sahte haberleri tespit etmeyi öğreten Türkçe mobil oyun.

Doğruluk Dedektifi; kullanıcıların sosyal medya paylaşımlarını analiz ettiği, senaryo simülasyonları oynadığı ve dezenformasyon farkındalığı kazandığı eğitici bir mobil oyundur. Expo (React Native) ile geliştirilmiş olup Android, iOS ve web tarayıcısında çalışır.

---

## 📱 Özellikler

- **Haber Lab** — Gerçek/sahte karar verme (swipe kartlar) + ipucu sistemi
- **Simülasyon** — Adım adım gerçek hayat senaryoları (WhatsApp mesajı, sahte alıntı, kriz anı)
- **Akademi** — 6 ders + quiz'ler; sıralı kilit sistemi
- **Profil** — XP sistemi, 5 rütbe kademesi, 8 rozet, günlük seri takibi
- **Yerel Auth** — Kod adı tabanlı hızlı giriş; tüm ilerleme cihazda AsyncStorage'da saklanır
- **Offline Mod** — API sunucusuna bağlanamazsan yerel yedek veri devreye girer
- Karanlık tema, haptic geri bildirim, responsive tasarım (telefon + tablet)

---

## 📚 Belgeler

| Konu | Dosya |
|---|---|
| Giriş yöntemleri, auth akışı, OAuth kurulumu | [`docs/AUTH.md`](docs/AUTH.md) |
| Responsive tasarım, `useResponsive` hook | [`docs/RESPONSIVE.md`](docs/RESPONSIVE.md) |
| XP, rütbe, rozet, streak sistemi | [`docs/GAME_MECHANICS.md`](docs/GAME_MECHANICS.md) |
| Drizzle/Replit PostgreSQL şeması, tablolar, seed data | [`docs/DATABASE.md`](docs/DATABASE.md) |
| Her ekranın detaylı açıklaması | [`docs/SCREENS.md`](docs/SCREENS.md) |
| Her bileşenin props ve davranış açıklaması | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) |
| UserContext ve ContentContext detayları | [`docs/CONTEXTS.md`](docs/CONTEXTS.md) |
| Kod tabanı haritası (klasör/dosya açıklamaları) | [`CODEBASE.md`](CODEBASE.md) |

---

## 🗂️ Proje Yapısı

```
dogruluk-dedektifi/
├── artifacts/
│   ├── mobile/                    ← Ana uygulama (Expo / React Native)
│   │   ├── app/                   ← Expo Router ekranları (dosya adı = route)
│   │   │   ├── _layout.tsx        ← Kök düzen, NavController, provider'lar
│   │   │   ├── onboarding.tsx     ← /onboarding — ince orkestratör (~80 satır)
│   │   │   ├── edit-profile.tsx   ← /edit-profile — ince orkestratör (~65 satır)
│   │   │   └── (tabs)/            ← Sekme ekranları (index, lab, academy, profile)
│   │   │
│   │   ├── components/            ← Single Responsibility bileşenler
│   │   │   ├── onboarding/        ← AuthStep, EmailStep, PhoneStep, OtpStep, NameStep + yardımcılar
│   │   │   ├── edit-profile/      ← EditProfileTopBar, UsernameField, BioField, TopicsPicker + yardımcılar
│   │   │   └── *.tsx              ← Paylaşımlı bileşenler (SwipeCard, XPBar, MissionCard vb.)
│   │   │
│   │   ├── hooks/                 ← Custom hook'lar
│   │   │   ├── useOnboardingAuth.ts ← Yerel kod adı auth state + onboarding akışı
│   │   │   ├── useEditProfile.ts    ← Profil form state + kaydetme mantığı
│   │   │   ├── useResponsive.ts     ← Responsive tasarım hesapları
│   │   │   └── useColors.ts         ← Renk sistemi
│   │   │
│   │   ├── context/               ← UserContext (auth + oyun), ContentContext (içerik)
│   │   ├── data/                  ← Offline yedek içerik (vakalar, dersler, simülasyonlar)
│   │   ├── constants/             ← Renk paleti
│   │   └── lib/                   ← API istemcisi
│   │
│   └── api-server/                ← Express.js REST API (altyapı hazır)
│
├── lib/                     ← Paylaşılan kütüphaneler (Drizzle, Zod, React Query)
├── supabase/                ← schema_and_seed.sql
├── docs/                    ← Özellik belgelemeleri
└── package.json
```

**Mimari ilke:** Her dosyanın tek sorumluluğu var. Ekran dosyaları (`app/*.tsx`) yalnızca routing yapar; iş mantığı hook'larda, UI hook'lardan bağımsız bileşenlerde yaşar.

---

## ⚙️ Gereksinimler

| Yazılım | Minimum | İndirme |
|---|---|---|
| **Node.js** | v20+ | https://nodejs.org |
| **pnpm** | v9+ | `npm install -g pnpm` |

> ⚠️ Bu proje **yalnızca pnpm** destekler. `npm install` veya `yarn` çalışmaz.

**Mobil test için (isteğe bağlı):**

| Hedef | Gerekli |
|---|---|
| Android | [Android Studio](https://developer.android.com/studio) |
| iPhone (fiziksel) | [Expo Go](https://expo.dev/go) (App Store'dan ücretsiz) |
| iPhone simülatör | macOS + Xcode |
| Web | Sadece Chrome/Firefox yeterli |

---

## 🚀 Kurulum

### 1. Repoyu İndir

```bash
git clone https://github.com/KULLANICI_ADIN/dogruluk-dedektifi.git
cd dogruluk-dedektifi
```

### 2. Bağımlılıkları Yükle

```bash
pnpm install
```

### 3. Veritabanını Kur (İlk Kez)

Replit Secrets panelinde `DATABASE_URL` tanımlanmış olmalıdır (Replit PostgreSQL otomatik sağlar).

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed
```

Detaylı bilgi için → [`docs/DATABASE.md`](docs/DATABASE.md)

### 4. Uygulamayı Başlat

```bash
pnpm --filter @workspace/mobile run dev
```

Expo QR kodu çıkınca:

| Platform | Ne Yapacaksın |
|---|---|
| Web | `w` tuşuna bas veya `localhost:PORT` aç |
| Android telefon | Expo Go'yu kur, QR kodu tara |
| iPhone | Kamerayı QR koda tut → linke tıkla |
| Android emülatör | `a` tuşuna bas |
| iOS simülatör | `i` tuşuna bas (Mac + Xcode gerekli) |

---

## 🖥️ İşletim Sistemine Göre Kurulum

### Windows

```powershell
# Node.js: https://nodejs.org → LTS indir → .msi kur
npm install -g pnpm
node --version   # v20+ olmalı
pnpm --version   # v9+ olmalı

git clone https://github.com/KULLANICI_ADIN/dogruluk-dedektifi.git
cd dogruluk-dedektifi && pnpm install
pnpm --filter @workspace/mobile run dev
```

**Android emülatörü (Windows) — Adım Adım:**

1. **Java JDK 17** kur: https://adoptium.net → `Temurin 17 (LTS)` seç → `.msi` kur
2. **Android Studio** indir + kur: https://developer.android.com/studio
   - Kurulumda "Android Virtual Device" seçeneğini işaretle
3. **SDK kurulumu:** Android Studio → `More Actions → SDK Manager`
   - `SDK Platforms` sekmesi → **Android 14 (API 34)** işaretle → Apply
   - `SDK Tools` sekmesi → **Android SDK Build-Tools**, **Android Emulator**, **Android SDK Platform-Tools** işaretle → Apply
4. **Ortam değişkenleri** ekle (Sistem Özellikleri → Gelişmiş → Ortam Değişkenleri):
   ```
   ANDROID_HOME = C:\Users\<KULLANICI_ADIN>\AppData\Local\Android\Sdk
   ```
   Aynı pencerede `Path` değişkenine ekle:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   ```
5. **Sanal cihaz oluştur:** Android Studio → `More Actions → Virtual Device Manager → Create Device`
   - Pixel 7 → API 34 → Finish
6. **Emülatörü başlat** (Virtual Device Manager'dan oynat düğmesi)
7. Expo çalışırken terminalde `a` tuşuna bas → uygulama emülatöre yüklenir

### Linux (Ubuntu / Debian)

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc && nvm install 24
npm install -g pnpm
sudo apt-get install git -y

git clone https://github.com/KULLANICI_ADIN/dogruluk-dedektifi.git
cd dogruluk-dedektifi && pnpm install
pnpm --filter @workspace/mobile run dev
```

### macOS

```bash
brew install node@24
npm install -g pnpm

git clone https://github.com/KULLANICI_ADIN/dogruluk-dedektifi.git
cd dogruluk-dedektifi && pnpm install
pnpm --filter @workspace/mobile run dev
```

iOS simülatörü için: Mac App Store'dan **Xcode**'u kur, bir kez aç, Expo çalışırken `i` bas.

---

## 🔧 Ortam Değişkenleri

| Yer | Değişken | Açıklama |
|---|---|---|
| Replit Secrets | `DATABASE_URL` | PostgreSQL bağlantı dizesi (Replit otomatik tanımlar) |
| `artifacts/api-server/.env` | `PORT` | API sunucu portu (varsayılan: 8080) |

> `EXPO_PUBLIC_API_URL` tanımlanmazsa mobil uygulama yerel yedek içerikle çalışmaya devam eder.

---

## 📦 Kullanılan Teknolojiler

### Mobil Uygulama

| Paket | Açıklama |
|---|---|
| `expo` ~54 | Mobil uygulama çerçevesi |
| `expo-router` ~6 | Dosya adına göre navigasyon |
| `react-native` 0.81.5 | Telefon/tablet UI katmanı |
| `react-native-reanimated` ~4.1 | Akıcı animasyonlar |
| `react-native-gesture-handler` ~2.28 | Swipe hareketleri |
| `@react-native-async-storage/async-storage` | Cihaza yerel veri kaydetme |
| `@expo/vector-icons` | Feather ikon seti |
| `@expo-google-fonts/inter` | Inter yazı tipi |
| `expo-haptics` | Dokunmatik titreşim |
| `expo-glass-effect` | iOS 26+ LiquidGlass sekme çubuğu |

### API Sunucusu

| Paket | Açıklama |
|---|---|
| `express` ^5 | HTTP sunucu çerçevesi |
| `pino` | Hızlı JSON loglama |
| `zod` | Tip güvenli şema doğrulama |
| `drizzle-orm` | TypeScript ORM |

---

## 🗺️ Yol Haritası

- [x] Yerel kod adı tabanlı hızlı giriş (AsyncStorage)
- [ ] Google / Apple OAuth entegrasyonu
- [ ] Bulut tabanlı oyun verisi senkronizasyonu (AsyncStorage → sunucu)
- [ ] Günlük haber API entegrasyonu (teyit.org vb.)
- [ ] Çok oyunculu sıralama tablosu
- [ ] Push bildirim sistemi
- [ ] App Store / Google Play yayını
- [ ] AI destekli yeni vaka üretimi

---

## ❓ Sık Karşılaşılan Sorunlar

**`pnpm install` hata veriyor:**
- `node --version` → v20+ olmalı
- `npm install -g pnpm` ile yeniden kur

**Expo başlıyor ama telefonda açılmıyor:**
- Telefon ve bilgisayar aynı Wi-Fi ağında olmalı
- Expo Go'nun güncel olduğundan emin ol

**API sunucusuna bağlantı çalışmıyor:**
- `DATABASE_URL` Replit Secrets'ta tanımlı olmalı
- Bağlanamazsa uygulama yerel verilerle çalışmaya devam eder

**Giriş ekranı çalışmıyor:**
- Kod adı girişi tamamen yerel çalışır; herhangi bir dış servis gerekmez
- Detaylı auth akışı → [`docs/AUTH.md`](docs/AUTH.md)

**`npm install` veya `yarn` hata veriyor:**
- Bu proje sadece `pnpm` destekler: `pnpm install` kullan

---

## 🤝 Katkı

```bash
git checkout -b feature/yeni-ozellik
git commit -m "feat: yeni özellik eklendi"
git push origin feature/yeni-ozellik
# Pull Request aç
```

---

## 📄 Lisans

MIT © 2026 — Doğruluk Dedektifi
