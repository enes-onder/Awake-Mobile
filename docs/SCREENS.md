# Ekranlar — Doğruluk Dedektifi

Expo Router kullanıldığından dosya adı = ekran yolu. Tüm ekranlar `artifacts/mobile/app/` içindedir.

---

## Navigasyon Haritası

```
app/
├── _layout.tsx          ← Kök düzen (provider'lar, yönlendirme, fontlar)
├── onboarding.tsx       ← /onboarding — giriş ve kod adı seçimi
├── edit-profile.tsx     ← /edit-profile — profil düzenleme (sağdan kayar)
├── +not-found.tsx       ← /* — bilinmeyen route
└── (tabs)/
    ├── _layout.tsx      ← Sekme çubuğu yapılandırması
    ├── index.tsx        ← / (Karargah)
    ├── lab.tsx          ← /lab (Haber Lab)
    ├── academy.tsx      ← /academy (Akademi)
    └── profile.tsx      ← /profile (Profil)
```

---

## `_layout.tsx` — Kök Düzen

Uygulamanın her yerinde görünmez ama her şeyi sarar.

**Provider zinciri (dıştan içe):**
```
SafeAreaProvider
  ErrorBoundary
    QueryClientProvider
      GestureHandlerRootView
        KeyboardProvider
          UserProvider
            ContentProviderWithXP
              DeepLinkHandler  (deep link yönetimi)
              NavController    (yönlendirme kararları)
              RootLayoutNav    (Stack ekran tanımları)
```

**NavController yönlendirme kuralları:**
- `authUser` yok → `/onboarding`
- `authUser` var + `username` boş → `/onboarding`
- `authUser` var + `username` dolu + anonim değil + onboarding'deyse → `/(tabs)`

**Fontlar:** Inter Regular / Medium / SemiBold / Bold yüklenir. Fontlar hazır olmadan hiçbir şey render edilmez.

**DeepLinkHandler:** E-posta magic link ve OAuth dönüşlerini yakalar. URL'de `access_token` veya `code=` varsa `supabase.auth.exchangeCodeForSession()` çağrılır.

---

## `onboarding.tsx` — Giriş ve Kayıt Ekranı (Orkestratör)

İlk açılışta ya da oturum açılmamışsa gösterilir. **~80 satır ince orkestratör** — iş mantığı `useOnboardingAuth` hook'unda, UI her adım bileşeninde yaşar.

### Mimari

```
app/onboarding.tsx          ← Sadece step routing (auth.step'e göre bileşen seçer)
hooks/useOnboardingAuth.ts  ← Tüm state + Supabase çağrıları
components/onboarding/
  AuthStep.tsx              ← Provider seçimi
  EmailStep.tsx             ← E-posta formu
  PhoneStep.tsx             ← Telefon formu
  OtpStep.tsx               ← OTP doğrulama
  NameStep.tsx              ← Kod adı seçimi
  OnboardingLogo.tsx        ← Paylaşımlı logo (GlowRing + kalkan)
  ErrorBox.tsx              ← Hata/başarı mesajı
  BackButton.tsx            ← Geri ok butonu
  styles.ts                 ← Tüm adımların paylaşımlı stilleri
```

### Adımlar

| Adım | Bileşen | Açıklama |
|---|---|---|
| `auth` | `AuthStep` | Google, Apple, E-posta, Telefon + Misafir seçeneği |
| `email` | `EmailStep` | Şifre veya magic link modu; kayıt/giriş toggle'ı |
| `phone` | `PhoneStep` | +90 ön eki otomatik; "SMS Gönder" |
| `otp` | `OtpStep` | 6 haneli kod; "Tekrar gönder" bağlantısı |
| `name` | `NameStep` | Min 2, max 18 karakter; "Göreve Başla" → `/(tabs)` |

### Auth Sonrası Otomatik Geçiş

`authUser` değişimi `app/onboarding.tsx` içindeki `useEffect` tarafından izlenir. Giriş başarılı + kod adı yok → otomatik `"name"` adımına geçiş. Google/Apple gibi async OAuth akışlarını da yakalar.

### Animasyonlar
- `FadeInUp.springify()` — her adım container'ı giriş animasyonu
- `FadeInDown.delay(n).springify()` — butonlar sıralı beliriş
- `GlowRing` — kalkan ikonunun nabız atan parlak halkası

---

## `(tabs)/_layout.tsx` — Sekme Navigasyonu

4 sekme: **Karargah** · **Lab** · **Akademi** · **Profil**

İki farklı görünüm:
- **LiquidGlass (iOS 26+):** `isLiquidGlassAvailable()` true ise Apple'ın cam efektli sekme çubuğu, SF Symbols ikonları
- **Klasik:** Android/web/eski iOS için — iOS'ta `BlurView` arka plan, Android'de düz renk, Feather ikonları

---

## `(tabs)/index.tsx` — Karargah

Ana ekran. Kullanıcı durumunu özetler.

### Bölümler (yukarıdan aşağı)

1. **Header** — Selamlama + sağ üstte `RankBadge`
2. **Streak Kartı** — Günlük seri sayısı; bugün oynanmadıysa sallanma animasyonu; seri 0'sa motivasyon mesajı
3. **XP Kartı** — `XPBar` + mevcut rütbe adı + bir sonraki rütbeye kalan XP
4. **3 İstatistik Kutusu** — Çözülen vaka / Doğruluk % / Toplam XP — sıralı `FadeIn` ile görünür
5. **Günlük Görev** — Tamamlanmamış ilk misyon öne çıkarılır; bugün oynanmamışsa "2× XP" rozeti; `PulseDot` mavi nokta
6. **Aktif Vakalar** — Yatay kaydırmalı misyon kartları (max 4); "Tümüne Bak" → lab sekmesi
7. **Tanıtım Kartları** — "Neden bu uygulama?" — 3 kart

### Responsive
- `maxWidth: r.maxW` ile içerik ortalanır
- Stat değerleri ve başlık `r.fs()` ile ölçeklenir
- Tablet genişliğinde misyon kartı genişliği 220px (telefon: 180px)

---

## `(tabs)/lab.tsx` — Haber Lab

İki sekme: **Vaka Analizi** ve **Simülasyon**

### Vaka Analizi — 3 Durum

| Durum | Görüntü |
|---|---|
| `list` | Tüm görevler kart listesi; tamamlananlar yeşil kenarlık + tik |
| `active` | Tam ekran `SwipeCard`; sağ=Doğru / sol=Yanlış; İpucu butonu |
| `result` | Doğru/yanlış göstergesi + kazanılan XP + açıklama + sonraki aksiyon |

**Yanlış yanıt cezası:** `Math.round(xpReward × 0.4)` XP düşülür.

**`CelebrationOverlay`:** Doğru/yanlış seçimde 1.5 saniyelik tam ekran animasyon.

### Simülasyon
- Listeden seçim → `SimulationPlayer` bileşenini açar
- Tamamlanınca `earnXP(totalXP)` çağrılır

### Responsive
- `useResponsive` hook'u; tablet'te `numColumns: 2`

---

## `(tabs)/academy.tsx` — Akademi

İki sekme: **Dersler** ve **Rozetler**

### Dersler

Dersler sıralı kilit sistemine sahip:
```
l1 (açık) → l2 (l1 tamamlanınca açılır) → l3 → ...
```

Her ders üç aşama içerir:
1. **Okuma** — Paragraflar + ilerleme çubuğu
2. **Quiz** — 4 seçenek; doğru +10 / yanlış -10 XP; cevap sonrası açıklama gösterilir
3. **Bitiş** — Toplam XP + 2 saniye sonra listeye dön

### Rozetler

8 rozetin tamamı 2 sütunlu ızgara ile `BadgeCard` bileşeniyle gösterilir.
- Kazanılmış: renkli, tam opaklık
- Kilitli: soluk, gri tonlu

Üstte "X / 8 rozet" sayacı.

### Responsive
- `useResponsive` hook'u; tablet'te `numColumns: 2`

---

## `(tabs)/profile.tsx` — Profil

### Bölümler

1. **Hero Kartı** — Kullanıcı adı baş harflerinden avatar dairesi; bio; favori konu etiketi; `RankBadge`; `XPBar`; streak sayısı
2. **4'lü İstatistik Izgarası** — Çözülen vaka / Doğruluk % / Toplam XP / Rozet sayısı
3. **Rütke Yolu** — 5 rütkenin yatay bağlantılı haritası; geçilmiş bağlantılar renkli, ilerisi gri
4. **Dijital Sertifika** — 800 XP eşiği ilerleme çubuğu; eşikte "Sertifika Kazanıldı" mesajı
5. **Düzenle Butonu** → `/edit-profile` ekranına gider

### Responsive
- `maxWidth: r.maxW` ile ortalanmış içerik
- İsim ve stat değerleri `r.fs()` ile ölçeklenir

---

## `edit-profile.tsx` — Profil Düzenleme (Orkestratör)

Sağdan kayan ekran (`slide_from_right` animasyonu). **~65 satır ince orkestratör** — iş mantığı `useEditProfile` hook'unda, her alan ayrı bir bileşende yaşar.

### Mimari

```
app/edit-profile.tsx              ← Sadece bileşenleri birleştirir, state dağıtır
hooks/useEditProfile.ts           ← Form state, doğrulama, kaydetme mantığı
components/edit-profile/
  EditProfileTopBar.tsx           ← Geri + başlık + Kaydet butonu
  UsernameField.tsx               ← Input + kilit + cooldown uyarısı
  BioField.tsx                    ← Textarea + 80 karakter sayacı
  TopicsPicker.tsx                ← 8 chip seçici grid (TOPICS sabiti burada)
  InfoCard.tsx                    ← "Değişiklikler hemen kaydedilir" notu
  UsernameWarningModal.tsx        ← Cooldown sınırı modal'ı
  SectionHeader.tsx               ← "KOD ADI", "BİO" bölüm etiketleri
  styles.ts                       ← Paylaşımlı StyleSheet
```

### Düzenlenebilir Alanlar

1. **Kod Adı** — 30 günlük cooldown; kilitliyse kilit ikonu + "X gün kaldı" modal
2. **Bio** — Max 80 karakter; multiline; karakter sayacı
3. **Favori Konu** — 8 chip: Siyaset, Sağlık, Bilim, Ekonomi, Sosyal Medya, Çevre, Teknoloji, Genel

**Kaydet butonu:** Değişiklik yoksa gri ve disabled; değişiklik varsa mavi ve aktif. Mantık `useEditProfile.hasChanges` ile hesaplanır.

---

## `+not-found.tsx` — 404 Sayfası

Tanımsız route'a gidilince gösterilir. "Bu sayfa bulunamadı" + ana sayfaya dönüş butonu.
