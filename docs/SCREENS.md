# Ekranlar — Doğruluk Dedektifi

Expo Router kullanıldığından dosya adı = ekran yolu. Tüm ekranlar `artifacts/mobile/app/` içindedir.

---

## Navigasyon Haritası

```
app/
├── _layout.tsx          ← Kök düzen (provider'lar, yönlendirme, fontlar)
├── onboarding.tsx       ← /onboarding — intro slaytlar + hızlı kod adı girişi
├── leaderboard.tsx      ← /leaderboard — liderlik tablosu (stack ekranı)
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
              NavController    (yönlendirme kararları)
              RootLayoutNav    (Stack ekran tanımları)
```

**NavController yönlendirme kuralları:**
- `username` yok → `/onboarding`
- `username` var + onboarding'deyse → `/(tabs)`

**Fontlar:** Inter Regular / Medium / SemiBold / Bold yüklenir. Fontlar hazır olmadan hiçbir şey render edilmez.

---

## `onboarding.tsx` — Giriş Ekranı (Orkestratör)

İlk açılışta ya da kullanıcı adı yoksa gösterilir. **~25 satır ince orkestratör** — UI `IntroSlides` ve `QuickEntryScreen` bileşenlerinde yaşar.

### Mimari

```
app/onboarding.tsx          ← Yerel step state: "intro" | "name"
components/onboarding/
  IntroSlides.tsx           ← 3 kaydırmalı tanıtım slaydı
  QuickEntryScreen.tsx      ← Kod adı girişi + mock Google/Apple
hooks/useOnboardingAuth.ts  ← nameInput state + handleStart()
```

### Adımlar

| Adım | Bileşen | Açıklama |
|---|---|---|
| `intro` | `IntroSlides` | 3 kaydırmalı slayt. "Atla" veya son slaydda "Göreve Başla" → `name` adımına geçer |
| `name` | `QuickEntryScreen` | Kod adı TextInput + "Hızlı Giriş (Anonim)" butonu + "veya" divider + mock Google/Apple butonlar |

### QuickEntryScreen Düzeni (yukarıdan aşağı)

1. Geri butonu (← intro'ya döner)
2. Kalkan logo + neon halka
3. "Kod Adını Seç, Ajan" başlığı + açıklama
4. Kod adı TextInput (neon mavi kenarlık aktifken)
5. **"Hızlı Giriş (Anonim)"** butonu → `handleStart()` çağırır
6. "veya" divider
7. **Google ile Devam Et** (mock, "Yakında" etiketi, opacity 0.65)
8. **Apple ile Devam Et** (mock, "Yakında" etiketi, opacity 0.65)
9. XP Kazan / Seri Kur / Rozet Al feature pill'leri

### Auth Durumu

Uygulamada **gerçek auth yoktur.** Kullanıcı bir kod adı girer, `UserContext.setUsername()` ile AsyncStorage'a kaydedilir. `isGuestMode: true` bayrağı profil ekranında uyarı gösterir.

→ Auth detayları: [`docs/AUTH.md`](docs/AUTH.md)

---

## `(tabs)/_layout.tsx` — Sekme Navigasyonu

4 sekme: **Karargah** · **Lab** · **Akademi** · **Profil**

---

## `(tabs)/index.tsx` — Karargah

Ana ekran. Kullanıcı durumunu özetler.

### Bölümler (yukarıdan aşağı)

1. **Header** — Selamlama + sağ üstte `RankBadge`
2. **Streak Kartı** — Günlük seri sayısı; bugün oynanmadıysa "sallanma" animasyonu
3. **XP Kartı** — `XPBar` + mevcut rütbe + bir sonraki rütkeye kalan XP
4. **3 İstatistik Kutusu** — Çözülen vaka / Doğruluk % / Toplam XP
5. **Günlük Görev** — Tamamlanmamış ilk misyon; "2× XP" rozeti; `PulseDot` mavi nokta
6. **Aktif Vakalar** — Yatay kaydırmalı misyon kartları (max 4); "Tümüne Bak" → lab

---

## `(tabs)/lab.tsx` — Haber Lab

İki sekme: **Vaka Analizi** ve **Simülasyon**

### Vaka Analizi — 3 Durum

| Durum | Görüntü |
|---|---|
| `list` | Tüm görevler kart listesi; tamamlananlar yeşil kenarlık + tik |
| `active` | Tam ekran `SwipeCard`; sağ=Doğru / sol=Yanlış; İpucu butonu |
| `result` | Doğru/yanlış + XP + açıklama + "Sonraki Vaka" / "Listeye Dön" |

**`CelebrationOverlay`:** Doğru/yanlış seçimde **2.3 saniyelik** üst-ekran toast. Safe-area uyumlu (notch'ın altında gösterilir, `Math.max(insets.top, 56) + 20` padding).

**SwipeCard yükseklik:** `Math.min(height - reservedPx, height * 0.52)` — küçük ekranlarda (iPhone SE) butonların altına düşmemesi için hesaplanır.

### Simülasyon

Listeden seçim → `SimulationPlayer` bileşenini açar. Tamamlanınca `earnXP()` çağrılır.

---

## `(tabs)/academy.tsx` — Akademi

İki sekme: **Dersler** ve **Rozetler**

### Dersler

Sıralı kilit sistemi: `l1 → l2 → l3 → ...` (önceki tamamlanınca sonraki açılır)

Her ders 3 aşama:
1. **Okuma** — Paragraflar + ilerleme çubuğu
2. **Quiz** — 4 seçenek; doğru +10 / yanlış -10 XP; cevap sonrası açıklama
3. **Bitiş** — Toplam XP + 2 saniye sonra listeye dön

### Rozetler

8 rozet 2 sütunlu ızgara. Kazanılmış: renkli; kilitli: soluk, gri.

---

## `(tabs)/profile.tsx` — Profil (Orkestratör)

**~115 satır orkestratör.** İş mantığı `useProfile` hook'unda.

### Bölümler (yukarıdan aşağı)

1. **ProfileHeader** — "Profil" başlığı + "Düzenle" butonu → `/edit-profile`
2. **HeroCard** — Avatar dairesi; isim; bio; favori konu; `RankBadge`; `XPBar`; streak
3. **AnonBanner** *(her zaman gösterilir — tüm kullanıcılar misafir modunda)* — Tıklanınca "Verileriniz yalnızca bu cihazda" Alert'i açar
4. **Liderlik Tablosu Kartı** — → `/leaderboard` açar
5. **StatsGrid** — 4'lü istatistik kartları
6. **RankPath** — 5 rütkenin yatay haritası
7. **CertCard** — 800 XP eşiği ilerleme çubuğu
8. **SignOutButton** — Oturumu kapatma (AsyncStorage siler, onboarding'e yönlendirir)

---

## `leaderboard.tsx` — Liderlik Tablosu (Stack Ekranı)

Sekme çubuğunda görünmez; profil ekranından `router.push("/leaderboard")` ile açılır.

**Veri:** `useLeaderboard` hook'u API'den çeker. API başarısız olursa 8 mock siber-ajan (Ajan_X, CyberSlayer vb.) gösterilir — tablo hiç boş kalmaz.

**Düzen:**
- Header: geri butonu + "Liderlik Tablosu" + kendi sıraman
- `FlatList`: header = `PodiumCard` (top 3), her satır = `LeaderRow`

---

## `edit-profile.tsx` — Profil Düzenleme (Orkestratör)

Sağdan kayan ekran. **~65 satır ince orkestratör** — iş mantığı `useEditProfile` hook'unda.

### Düzenlenebilir Alanlar

1. **Kod Adı** — 30 günlük cooldown; kilitliyse modal
2. **Bio** — Max 80 karakter; karakter sayacı
3. **Favori Konu** — 8 chip: Siyaset / Sağlık / Bilim / Ekonomi / Sosyal Medya / Çevre / Teknoloji / Genel

**Kaydet butonu:** Değişiklik yoksa gri+disabled; değişiklik varsa mavi+aktif.

---

## `+not-found.tsx` — 404 Sayfası

Tanımsız route'a gidilince gösterilir. "Bu sayfa bulunamadı" + ana sayfaya dönüş butonu.
