# 🔍 Doğruluk Dedektifi

> Dezenformasyona karşı silahlan. Sahte haberleri tespit etmeyi öğreten Türkçe mobil eğitim oyunu.

---

## Kısa Tanım

**Doğruluk Dedektifi**, kullanıcıların sosyal medya paylaşımlarını analiz ettiği, senaryo simülasyonları oynadığı ve medya okuryazarlığı kazandığı eğitici bir mobil oyundur. Expo (React Native) ile geliştirilmiş olup Android, iOS ve web tarayıcısında çalışır.

---

## Problem

Türkiye'de ve dünyada dezenformasyon hızla yayılmakta; vatandaşlar sahte haber ile gerçek haberi ayırt etmekte zorlanmaktadır. Mevcut farkındalık içerikleri çoğunlukla pasif okuma biçiminde sunulmakta, etkileşimli ve ölçülebilir bir öğrenme deneyimi sunmamaktadır.

---

## Hedef Kitle

- Medya okuryazarlığını geliştirmek isteyen gençler ve yetişkinler
- Dijital haberleri sık tüketen sosyal medya kullanıcıları
- Dezenformasyon farkındalığı üzerine eğitim veren öğretmenler ve eğitmenler
- Sivil toplum kuruluşları ve basın özgürlüğü alanında çalışan kuruluşlar

---

## Ürün Ne İşe Yarar

Doğruluk Dedektifi, oyunlaştırılmış öğrenme döngüsü üzerine kuruludur:

1. **Giriş** — Kullanıcı bir kod adı seçerek uygulamaya başlar; hesap oluşturmaya veya kişisel bilgi vermeye gerek yoktur.
2. **Vaka Analizi** — Gerçek sosyal medya senaryolarından uyarlanan haberler kartlara yansıtılır. Kullanıcı sola/sağa kaydırarak "Sahte" veya "Gerçek" kararı verir; dilerse ipucu satın alabilir.
3. **Simülasyon** — WhatsApp mesajı, siyasetçi alıntısı, kriz anı gibi gerçekçi senaryolarda adım adım karar alınır.
4. **Akademi** — 6 modüllük ders içeriği (tersine görsel arama, metadata analizi, kaynak doğrulama vb.) ve her modülün sonunda kısa quiz.
5. **İlerleme** — Doğru kararlar XP kazandırır; XP arttıkça rütbe yükselir, rozetler açılır, günlük seri takip edilir.
6. **Liderlik Tablosu** — Topluluk genelinde XP sıralaması.

---

## Ana Özellikler

| Özellik | Açıklama |
|---|---|
| **Haber Lab** | Gerçek/sahte karar (swipe) + 3 aşamalı ipucu sistemi |
| **Simülasyon** | Adım adım senaryo oynatıcı (WhatsApp, sahte alıntı, kriz anı) |
| **Akademi** | 6 ders + quiz; sıralı kilit sistemi |
| **XP & Rütbe** | Çaylak → Araştırmacı → Analist → Kıdemli Analist → Baş Dedektif |
| **8 Rozet** | Özel başarı koşullarıyla açılan kalıcı rozetler |
| **Günlük Seri** | Her gün oynamak streak sayısını artırır |
| **Liderlik Tablosu** | XP tabanlı topluluk sıralaması |
| **Offline Mod** | API erişilemezse yerel yedek içerik devreye girer |
| **Çoklu Platform** | Android, iOS ve web tarayıcısı desteği |

> **Not:** Kullanıcı adı ve oyun ilerleme verisi cihazda (`AsyncStorage`) saklanır; liderlik tablosu için arka uca senkronize edilir. Liderlik tablosu topluluk/demo amaçlıdır; XP değerleri istemci tarafından gönderildiğinden hileye dayanıklı rekabetçi bir skor sistemi değildir. Detaylar için bkz. [`docs/AUTH.md`](docs/AUTH.md).

---

## Uygulama Akışı

```
Uygulama açılır
    ↓
Kullanıcı adı kayıtlı mı? (AsyncStorage)
    ├── HAYIR → Onboarding (tanıtım slaytları → kod adı girişi)
    └── EVET  → Ana uygulama
         ↓
ContentContext → Express API'den içerik çek
    ├── Başarılı → API verisi kullanılır
    └── Başarısız → data/*.ts yerel yedeklere geçilir
         ↓
Kullanıcı oynar (Lab / Akademi / Simülasyon)
    ↓
XP & ilerleme → AsyncStorage'a kaydedilir
    ↓
Liderlik tablosu → POST /api/profiles/upsert ile senkronize edilir
```

---

## Kullanılan Teknolojiler

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

### API Sunucusu

| Paket | Açıklama |
|---|---|
| `express` ^5 | HTTP sunucu çerçevesi |
| `pino` | Hızlı JSON loglama |
| `zod` | Tip güvenli şema doğrulama |
| `drizzle-orm` | TypeScript ORM |
| `@neondatabase/serverless` | PostgreSQL bağlantısı |

### Veritabanı

**Replit PostgreSQL** — Drizzle ORM ile yönetilir. Şema konumu: `lib/db/src/schema/index.ts`. Detaylar için bkz. [`docs/DATABASE.md`](docs/DATABASE.md).

---

## Kurulum

### Gereksinimler

| Yazılım | Minimum | İndirme |
|---|---|---|
| **Node.js** | v20+ | https://nodejs.org |
| **pnpm** | v9+ | `npm install -g pnpm` |

> ⚠️ Bu proje **yalnızca pnpm** destekler. `npm install` veya `yarn` çalışmaz.

### Adımlar

#### 1. Repoyu İndir

```bash
git clone https://github.com/KULLANICI_ADIN/dogruluk-dedektifi.git
cd dogruluk-dedektifi
```

#### 2. Bağımlılıkları Yükle

```bash
pnpm install
```

#### 3. Veritabanını Kur (İlk Kez)

`DATABASE_URL` ortam değişkeni tanımlı olmalıdır (Replit ortamında Secrets panelinden otomatik gelir).

```bash
pnpm --filter @workspace/db run push
pnpm --filter @workspace/db run seed
```

Detaylı bilgi için → [`docs/DATABASE.md`](docs/DATABASE.md)

---

## Çalıştırma

### API Sunucusunu Başlat

```bash
cd artifacts/api-server
PORT=3001 node ./build.mjs && PORT=3001 node --enable-source-maps ./dist/index.mjs
```

### Mobil Uygulamayı Başlat

```bash
pnpm --filter @workspace/mobile run dev
```

Expo başladıktan sonra:

| Platform | Ne Yapılır |
|---|---|
| Web | `w` tuşuna bas veya tarayıcıdan URL'yi aç |
| Android telefon | Expo Go uygulamasını kur, QR kodu tara |
| iPhone | Kamerayı QR koda tut → linke tıkla |
| Android emülatör | `a` tuşuna bas |
| iOS simülatör | `i` tuşuna bas (macOS + Xcode gerekli) |

### Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | Evet (API için) | PostgreSQL bağlantı dizesi |
| `PORT` | Hayır | API sunucu portu (varsayılan: 3001) |

> `EXPO_PUBLIC_API_URL` **tanımlanmamalıdır.** Bundle, relative URL kullanır; web-proxy isteği doğru porta yönlendirir.

---

## Proje Yapısı

```
dogruluk-dedektifi/
├── artifacts/
│   ├── mobile/              ← Expo React Native uygulaması
│   │   ├── app/             ← Expo Router ekranları
│   │   ├── components/      ← UI bileşenleri (tek sorumluluk)
│   │   ├── hooks/           ← İş mantığı hook'ları
│   │   ├── context/         ← UserContext, ContentContext
│   │   ├── data/            ← Offline yedek içerik
│   │   └── lib/             ← API istemcisi
│   └── api-server/          ← Express REST API
├── lib/
│   ├── db/                  ← Drizzle ORM şeması
│   ├── api-spec/            ← OpenAPI tanımı
│   └── api-zod/             ← Zod şemaları
├── docs/                    ← Özellik belgeleri
└── package.json
```

Kod tabanının tüm klasör/dosya haritası için → [`CODEBASE.md`](CODEBASE.md)

---

## Belgeler

| Konu | Dosya |
|---|---|
| Giriş yöntemi, auth akışı, güven sınırları | [`docs/AUTH.md`](docs/AUTH.md) |
| XP, rütbe, rozet, streak sistemi | [`docs/GAME_MECHANICS.md`](docs/GAME_MECHANICS.md) |
| Drizzle/PostgreSQL şeması, tablolar, seed data | [`docs/DATABASE.md`](docs/DATABASE.md) |
| Her ekranın ayrıntılı açıklaması | [`docs/SCREENS.md`](docs/SCREENS.md) |
| Her bileşenin props ve davranış açıklaması | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) |
| UserContext ve ContentContext | [`docs/CONTEXTS.md`](docs/CONTEXTS.md) |
| Responsive tasarım, `useResponsive` hook | [`docs/RESPONSIVE.md`](docs/RESPONSIVE.md) |
| Kod tabanı haritası | [`CODEBASE.md`](CODEBASE.md) |

---

## Final Teslim Notu

Bu uygulama **Doğruluk Dedektifi** adıyla geliştirilmiş; medya okuryazarlığı ve dezenformasyon farkındalığı konusunda etkileşimli bir öğrenme aracı olarak tasarlanmıştır.

**Teslim kapsamı:**

- Expo React Native mobil uygulaması (Android, iOS, Web)
- Express REST API + Drizzle ORM + PostgreSQL arka uç
- Oyun mekaniği: XP, rütbe, rozet, streak, günlük çarpan, liderlik tablosu
- 8 vaka, 6 ders, 3 simülasyon (veritabanı + offline yedek)
- Cihaz tabanlı anonim giriş (AsyncStorage)
- Offline öncelikli mimari (API erişilemezse yerel verilerle çalışır)

**Teknik kararlar:**

- Auth sunucu tarafı değil, cihaz tabanlıdır (kod adı + AsyncStorage). Liderlik tablosu topluluk/demo amaçlıdır.
- İçerik kilitleme (XP kapısı) istemci tarafında hesaplanır; API yalnızca mount sırasında bir kez çağrılır.
- Tüm XP güncellemeleri atomik olarak tek state yazımında yapılır; paralel çağrılardan kaynaklanan state kayması engellenmiştir.

---

## Test Kontrol Listesi

Teslim öncesinde aşağıdaki akışların el ile doğrulanması önerilir:

- [ ] Yeni kod adıyla giriş → Karargah ekranına yönlendirilme
- [ ] İlk vakayı doğru çöz → XP balonu + profil XP artışı tutarlı
- [ ] Aynı gün ikinci vakada XP çarpanı `×1` (ilkinde `×2` olmalı)
- [ ] İpucu kullan → `-5 XP` net hesaba yansıyor
- [ ] Yanlış cevap → negatif XP düşümü, vaka listede kalıyor
- [ ] Gerçek haberi doğru işaretle → `fakesDetected` artmıyor
- [ ] Ders tamamla → XP + tamamlanan ders listesi korunuyor
- [ ] Simülasyonu tamamla → XP verildi, ikinci açılışta tekrar verilmiyor
- [ ] Uygulamayı kapat/aç → tüm ilerleme korunuyor (AsyncStorage)
- [ ] API sunucusu kapalıyken aç → offline yedek içerikle çalışıyor
- [ ] Liderlik tablosu açılıyor → sıralama görünüyor (veya mock veri)
- [ ] Profil düzenleme → kod adı cooldown, bio, favori konu kaydediliyor
- [ ] Çıkış yap → onboarding'e dönüyor, ilerleme sıfırlanıyor

### Tip Kontrolü

```bash
pnpm run typecheck
```

---

## Lisans

MIT © 2026 — Doğruluk Dedektifi
