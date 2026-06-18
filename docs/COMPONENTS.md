# Bileşenler — Doğruluk Dedektifi

Tüm yeniden kullanılabilir UI parçaları `artifacts/mobile/components/` içindedir.

**Mimari ilke:** Her bileşenin tek sorumluluğu var. Ekran dosyaları (`app/*.tsx`) sadece routing yapar; iş mantığı hook'larda, UI bu bileşenlerde yaşar.

---

## `onboarding/` — Onboarding Adım Bileşenleri

`app/onboarding.tsx` ince orkestratörüne hizmet eden bileşen grubu.

### `QuickEntryScreen.tsx` ← Ana giriş ekranı

**Props:**
```typescript
{
  nameInput: string;
  setNameInput: (v: string) => void;
  nameInputRef: React.RefObject<TextInput | null>;
  canStart: boolean;        // nameInput.trim().length >= 2
  handleStart: () => void;  // setUsername(name) → router.replace("/(tabs)")
  onBack: () => void;       // step = "intro"'ya döner
}
```

**Düzen (koyu siber tema, `#070B14` bg):**
- Geri butonu
- Kalkan logosu + neon mavi glow halkası
- "Kod Adını Seç, Ajan" başlığı
- TextInput — neon mavi kenarlık `canStart` true iken
- **"Hızlı Giriş (Anonim)"** butonu (`#2B7FFF`, `canStart` false iken soluk)
- "Hesap oluşturmadan, kaydedilmez" küçük notu
- "veya" divider
- Google mock butonu (opacity 0.65, "Yakında" etiketi)
- Apple mock butonu (opacity 0.65, "Yakında" etiketi)
- XP / Seri / Rozet feature pill'leri

### `IntroSlides.tsx`

**Props:** `{ onFinish: () => void }`

3 kaydırmalı slayt. Yatay `FlatList` + `pagingEnabled`. "Atla" butonu + "Devam Et"/"Göreve Başla" CTA. `useSafeAreaInsets` ile notch uyumlu.

### `OnboardingLogo.tsx`

**Props:** `{ delay?: number }`

`GlowRing` + Feather kalkan ikonu. Tüm onboarding adımlarında paylaşımlı logo.

### `GlowRing.tsx`

Nabız atan animasyonlu ışık halkası (`withRepeat` + `withSequence`, Reanimated).

### `ErrorBox.tsx`

**Props:** `{ error: string | null }`

Hata mesajı kutusu. `"✅"` öneki başarı mesajlarını ayırt eder (yeşil vs kırmızı).

### `BackButton.tsx`

Sol üst ok butonu. `{ onPress, color?, bgColor? }` props'larını alır.

### `AuthScreen.tsx`

Eski email/şifre ekranı — **aktif onboarding akışında kullanılmıyor.** Geriye dönük uyumluluk için dosya mevcut.

### `NameStep.tsx`

Eski bağımsız kod adı adımı — **aktif onboarding akışında kullanılmıyor.** QuickEntryScreen bu işlevi üstlendi.

### `styles.ts`

Tüm onboarding bileşenlerinin paylaşımlı `StyleSheet` nesnesi.

### `types.ts`

```typescript
type Step = "intro" | "name" | "auth" | "email" | "phone" | "otp";
type AuthProvider = "google" | "apple" | "email" | "phone";
interface ProviderItem { id: AuthProvider; label: string; icon: string; color: string; }
```

---

## `profile/` — Profil Ekranı Bileşenleri

`app/(tabs)/profile.tsx` ince orkestratörüne hizmet eden bileşen grubu.

| Bileşen | Props | Sorumluluğu |
|---|---|---|
| `ProfileInitials` | `{ username }` | İsmin baş harflerinden daire avatar |
| `ProfileHeader` | `{ onEditPress }` | "Profil" başlığı + Düzenle butonu |
| `HeroCard` | `{ username, bio, favoriteTopic, rank, nextRank, xp, xpProgress, streak }` | Avatar, isim, bio, konu, RankBadge, XPBar, streak |
| `AnonBanner` | — | Misafir uyarısı — tıklanınca Alert gösterir; `isGuestMode === true` olduğunda profil'de görünür |
| `StatsGrid` | `{ items: StatItem[], startDelay? }` | 4'lü istatistik kart ızgarası |
| `RankPath` | `{ ranks, userXp, rankIdx, delay? }` | 5 rütkenin yatay haritası |
| `CertCard` | `{ xp, delay? }` | 800 XP eşiği ilerleme çubuğu |
| `SignOutButton` | `{ onSignOut, delay? }` | AsyncStorage silen çıkış butonu |
| `styles.ts` | — | Paylaşımlı StyleSheet |

---

## `edit-profile/` — Profil Düzenleme Bileşenleri

`app/edit-profile.tsx` ince orkestratörüne hizmet eden bileşen grubu.

| Bileşen | Sorumluluğu |
|---|---|
| `SectionHeader` | "KOD ADI", "BİO" gibi küçük bölüm etiketleri |
| `EditProfileTopBar` | Geri butonu + "Profili Düzenle" başlığı + Kaydet butonu |
| `UsernameField` | Input + kullanıcı ikonu + kilit rozeti + cooldown uyarı satırı |
| `BioField` | Multiline textarea + `{n}/80` karakter sayacı |
| `TopicsPicker` | 8 konuluk chip grid; `TOPICS` sabiti bu dosyada |
| `InfoCard` | "Değişiklikler hemen kaydedilir" statik bilgi kartı |
| `UsernameWarningModal` | 30 günlük cooldown modal'ı; kalan gün sayısı gösterir |
| `styles.ts` | Tüm edit-profile bileşenlerinin paylaşımlı StyleSheet |

---

## `lab/` — Haber Lab Bileşenleri

`app/(tabs)/lab.tsx` ve `hooks/useLabState.ts` ikilisine hizmet eden bileşenler.

| Bileşen | Props | Sorumluluğu |
|---|---|---|
| `ActiveMissionView` | `{ activeMission, topPadding, bottomInset, celebVisible, ...handlers }` | Aktif görev görünümü: sabit header + SwipeCard alanı |
| `MissionResultView` | `{ activeMission, lastCorrect, lastXP, topPadding, bottomInset, ...handlers }` | Sonuç ekranı: başarı/başarısızlık + XP + açıklama + aksiyon butonları |
| `VakalarTab` | `{ pendingMissions, completedMissions, onStartMission }` | Bekleyen/tamamlanan görev listesi |
| `SimulasyonTab` | `{ simulations, completedSims, onStartSim }` | Simülasyon kart listesi |
| `LabTabButton` | `{ label, icon, active, onPress }` | "Vaka Analizi" / "Simülasyon" sekme butonu |
| `labStyles.ts` | — | Tüm lab bileşenlerinin paylaşımlı StyleSheet |

---

## `swipe/` — SwipeCard Alt Bileşenleri

`SwipeCard.tsx` orkestratörüne hizmet eden parçalar.

| Bileşen/Dosya | Sorumluluğu |
|---|---|
| `useSwipeGesture.ts` | `PanResponder` tabanlı sürükleme; threshold aşılınca `onVerdictSelected` çağırır; −5 XP ceza animasyonu |
| `SwipeOverlays.tsx` | "DOĞRU"/"YANLIŞ" overlay etiketleri + kilit damgası (tüm karta yayılan) |
| `PostContent.tsx` | Platform çubuğu, gönderi avatar+isimleri, post metni, medya etiketi, istatistikler |
| `CluesArea.tsx` | `clues[0..clueIndex]` arasındaki ipuçlarını listeler |
| `VerdictButtons.tsx` | "İpucu Al" (−5 XP) + "YANLIŞ" (kırmızı) + "DOĞRU" (yeşil) butonları |
| `swipeCardStyles.ts` | StyleSheet |
| `swipeConstants.ts` | `PLATFORM_ICONS`, `PLATFORM_COLORS`, `SWIPE_THRESHOLD` |

---

## `leaderboard/` — Liderlik Tablosu Bileşenleri

`app/leaderboard.tsx` ekranına hizmet eden bileşenler.

| Bileşen/Dosya | Sorumluluğu |
|---|---|
| `PodiumCard.tsx` | İlk 3 oyuncunun podyum görünümü (FlatList header olarak kullanılır) |
| `LeaderRow.tsx` | Tek bir oyuncu satırı (FadeIn animasyonlu giriş, sıra numarası, XP, streak) |
| `LeaderboardStates.tsx` | `LoadingState` (spinner), `ErrorState` (wifi-off + tekrar dene), `EmptyState` |
| `leaderboardHelpers.ts` | `getRankColor()`, `getRankName()`, `MEDAL_CONFIG` (🥇🥈🥉 renkleri) |
| `leaderboardStyles.ts` | StyleSheet |

---

## `home/` — Karargah Bileşenleri

`app/(tabs)/index.tsx` ekranına hizmet eden bileşenler.

| Bileşen/Dosya | Sorumluluğu |
|---|---|
| `StreakCard.tsx` | Günlük seri sayısı; seri 0'sa motivasyon mesajı; bugün oynanmamışsa çalkalama animasyonu |
| `XPProgressCard.tsx` | `XPBar` + mevcut rütke adı + bir sonraki rütkeye kalan XP |
| `StatsRow.tsx` | 3 istatistik kutusu (çözülen vaka / doğruluk % / toplam XP), sıralı FadeIn |
| `DailyMissionCard.tsx` | Tamamlanmamış ilk misyon; bugün oynanmamışsa "2× XP" rozeti; `PulseDot` mavi nokta |
| `ActiveMissionsList.tsx` | Yatay kaydırmalı misyon kartları (max 4); "Tümüne Bak" → lab sekmesi |
| `StreakBonusToast.tsx` | Giriş streak bonusu ("+10 XP") toast bildirimi; FlatList header olarak |
| `PulseDot.tsx` | Animasyonlu nabız noktası (Reanimated `withRepeat`) |
| `missionHelpers.ts` | `diffColor()`, `diffLabel()`, `TYPE_ICONS` sabit haritası |
| `homeStyles.ts` | StyleSheet |

---

## `simulation/` — SimulationPlayer Alt Bileşenleri

`SimulationPlayer.tsx` orkestratörüne hizmet eden parçalar.

| Bileşen/Dosya | Sorumluluğu |
|---|---|
| `NarrativeStep.tsx` | Anlatı adımı kartı (metin + ikon) |
| `ChoiceStep.tsx` | Seçim adımı; seçimden sonra doğru/yanlış açıklaması gösterir |
| `AnimatedChoiceButton.tsx` | Seçildikten sonra doğru/yanlış renge geçen animasyonlu buton |
| `SimTopBar.tsx` | X (kapat) butonu + ilerleme çubuğu |
| `SimContinueBar.tsx` | "Devam Et" / "Sonraki" butonu barı (ekrana sabitli) |
| `SimDoneScreen.tsx` | Simülasyon tamamlama ekranı (XP göstergesi + çıkış) |
| `simStyles.ts` | StyleSheet |

---

## Paylaşımlı Bileşenler (kök `components/`)

| Bileşen | Sorumluluğu |
|---|---|
| `SwipeCard.tsx` | **Orkestratör** — `useSwipeGesture` + `SwipeOverlays` + `PostContent` + `CluesArea` + `VerdictButtons`. Kart max yüksekliği `Math.min(height - reservedPx, height * 0.52)` |
| `SimulationPlayer.tsx` | **Orkestratör** — adım adım senaryo oynatıcı (~170 satır) |
| `CelebrationOverlay.tsx` | Doğru/yanlış toast animasyonu. `absoluteFillObject` + safe-area padding (`Math.max(insets.top, 56) + 20`). Reanimated ile giriş/çıkış. |
| `XPFloater.tsx` | Uçan "+N XP" balonu — karar sonrası yukarı kayarak solar |
| `XPBar.tsx` | Rütke XP ilerleme çubuğu (animasyonlu dolum) |
| `RankBadge.tsx` | Rütke ikon+isim rozeti; `size: "sm" | "md"` |
| `BadgeCard.tsx` | Rozet kartı; `earned: true` ise renkli, false ise gri |
| `MissionCard.tsx` | Görev listesi kartı; `compact` prop ile kısa sürüm |
| `ErrorBoundary.tsx` | Global hata yakalayıcı (class component) |
| `ErrorFallback.tsx` | Hata ekranı UI'ı (`ErrorDetailsModal` DEV'de açılır) |
| `KeyboardAwareScrollViewCompat.tsx` | Web/native klavye scroll adaptörü |
