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

## `onboarding.tsx` — Giriş ve Kayıt Ekranı

İlk açılışta ya da oturum açılmamışsa gösterilir. 5 adımlı state machine içerir.

### Adımlar

| Adım | Görüntü | Açıklama |
|---|---|---|
| `auth` | Giriş yöntemi seçimi | Google, Apple, E-posta, Telefon butonları + Misafir seçeneği |
| `email` | E-posta formu | Şifre ile veya magic link; kayıt/giriş toggle'ı |
| `phone` | Telefon formu | +90 numarası giriş, "SMS Gönder" butonu |
| `otp` | OTP doğrulama | 6 haneli kod girişi |
| `name` | Kod adı seçimi | Min 2, max 18 karakter; "Göreve Başla" → `/(tabs)` |

### Animasyonlar
- `FadeInUp.springify()` — adım container'ı
- `FadeInDown.delay(n).springify()` — her buton sıralı olarak
- `GlowRing` bileşeni: kalkan ikonunun etrafında dönen parlak halka

### Auth Sonrası Otomatik Geçiş

```typescript
useEffect(() => {
  if (authUser && !username && (step === "auth" || step === "email" || step === "phone")) {
    setStep("name");
  }
}, [authUser]);
```

Herhangi bir yöntemle giriş başarılı olunca ve kullanıcının henüz kod adı yoksa, bu hook otomatik olarak `name` adımına geçer.

### Responsive
- `container`: `alignItems: "center"`
- `inner`: `width: "100%"`, `maxWidth: 430`
- Buton ve başlık font boyutları `rfs()` ile ölçeklenir

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

## `edit-profile.tsx` — Profil Düzenleme

Sağdan kayan ekran (`slide_from_right` animasyonu).

### Düzenlenebilir Alanlar

1. **Kod Adı** — 30 günlük cooldown; kilitliyse kilit ikonu + "X gün kaldı" modal
2. **Bio** — Max 80 karakter; multiline; karakter sayacı
3. **Favori Konu** — 8 chip seçeneği: Siyaset, Sağlık, Bilim, Ekonomi, Sosyal Medya, Çevre, Teknoloji, Genel

**Kaydet butonu:** Değişiklik yoksa gri ve disabled. Değişiklik varsa mavi ve aktif.

---

## `+not-found.tsx` — 404 Sayfası

Tanımsız route'a gidilince gösterilir. "Bu sayfa bulunamadı" + ana sayfaya dönüş butonu.
