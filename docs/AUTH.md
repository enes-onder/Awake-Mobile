# Kimlik Doğrulama Sistemi — Doğruluk Dedektifi

Uygulama **Supabase kullanmaz.** Auth tamamen yerel cihaz tabanlıdır: kullanıcı bir "kod adı" seçer, bu isim `AsyncStorage`'a kaydedilir ve her açılışta buradan yüklenir.

---

## Giriş Yöntemi: Hızlı Anonim Giriş

| Yöntem | Durum | Notlar |
|---|---|---|
| Kod adı ile hızlı giriş | ✅ Çalışıyor | Kullanıcı adı + AsyncStorage tabanlı |
| Google ile Giriş | 🔜 Yakında | Şu an mock buton (henüz aktif değil) |
| Apple ile Giriş | 🔜 Yakında | Şu an mock buton (henüz aktif değil) |

---

## Giriş Akışı

```
Uygulama açılır
        ↓
_layout.tsx → NavController tetiklenir
        ↓
AsyncStorage'da username var mı?
  YOK  → /onboarding ekranına yönlendir
  VAR  → /(tabs) ana uygulamaya yönlendir
        ↓
ONBOARDING ADIMLARI:
  "intro"   → 3 tanıtım slaydı (kaydırılabilir)
      ↓ "Göreve Başla" veya "Atla"
  "name"    → QuickEntryScreen (kod adı + mock sosyal butonlar)
      ↓ "Hızlı Giriş (Anonim)" butonuna basılır
  /(tabs)   → Ana uygulama
```

---

## Veri Saklama

Tüm kullanıcı verisi (`UserContext`) tek bir AsyncStorage anahtarında JSON olarak tutulur:

```
@dogruluk_user_v2 → {
  username, bio, favoriteTopic, usernameLastChanged,
  xp, streak, lastPlayDate, lastLoginDate,
  completedMissions, completedLessons, badges,
  correctAnswers, totalAnswers, fakesDetected,
  isGuestMode
}
```

**Önemli:** Veriler yalnızca kullanıcının cihazında saklanır. Uygulama silinirse veya cihaz değiştirilirse tüm ilerleme kaybolur. Bu yüzden `AnonBanner` uyarısı her zaman gösterilir.

---

## Misafir (Anonim) Kullanıcı Tespiti

`UserContext.ts` içinde:

```typescript
const isAnonymous = state.isGuestMode;      // true → misafir modu
```

`isGuestMode` varsayılan olarak `true` gelir ve Google/Apple gerçek auth entegre edilene kadar her kullanıcı misafir sayılır. Bu bayrak:
- Profil ekranında `AnonBanner`'ın gösterilmesini sağlar
- Kullanıcının ilerlemenin kaydedilmediği konusunda uyarılmasını sağlar

---

## NavController (Yönlendirme)

`artifacts/mobile/app/_layout.tsx` içindeki `NavController` fonksiyonu:

```typescript
if (!username) {
  if (!inOnboarding) router.replace("/onboarding");
} else {
  if (inOnboarding) router.replace("/(tabs)");
}
```

- Username yoksa → `/onboarding`'e yönlendir
- Username varsa ve onboarding'deyse → `/(tabs)`'a yönlendir

---

## Çıkış Yapma (Sign Out)

`UserContext.signOut()` çağrılınca:
1. `AsyncStorage.removeItem(STORAGE_KEY)` — yerel veri silinir
2. `setState(defaultState)` — state sıfırlanır (username boşalır)
3. `NavController` devreye girer → `/onboarding`'e yönlendirir

---

## Profil Düzenleme

Kullanıcı `/edit-profile` ekranında şunları değiştirebilir:
- **Kod Adı** — 30 günlük cooldown (birden fazla değişikliği önler)
- **Bio** — max 80 karakter
- **Favori Konu** — 8 seçenekli chip (Siyaset, Sağlık, Bilim, Ekonomi, Sosyal Medya, Çevre, Teknoloji, Genel)

---

## Backend Senkronizasyonu

Kullanıcı profili değiştiğinde `api.syncProfile()` çağrılarak API sunucusuna gönderilir (liderlik tablosu için):

```typescript
api.syncProfile({
  username, xp, streak, level, bio, favoriteTopic
})
```

Bu çağrı başarısız olursa sessizce görmezden gelinir (offline öncelikli mimari).

---

## İlgili Dosyalar

| Dosya | Rolü |
|---|---|
| `context/UserContext.tsx` | Tüm kullanıcı state'i, `isGuestMode`, `signOut`, `setUsername` |
| `hooks/useOnboardingAuth.ts` | Onboarding state yönetimi, `handleStart()` |
| `app/onboarding.tsx` | `intro → name` adım yönlendirici |
| `components/onboarding/QuickEntryScreen.tsx` | Kod adı girişi + mock sosyal butonlar |
| `components/onboarding/IntroSlides.tsx` | 3 tanıtım slaydı |
| `components/profile/AnonBanner.tsx` | Misafir uyarı banner'ı |
| `app/_layout.tsx` | NavController (yönlendirme kararları) |
