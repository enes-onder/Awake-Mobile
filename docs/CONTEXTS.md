# Context'ler — Doğruluk Dedektifi

Uygulama durumu iki React Context ile yönetilir. Her ikisi de `artifacts/mobile/context/` içindedir.

---

## `UserContext.tsx` — Kullanıcı ve Oyun Durumu

Uygulamadaki en kritik dosya. Kullanıcının tüm oyun ilerlemesini ve yerel profil bilgisini yönetir.

> **Mimari not:** Uygulama **Supabase kullanmaz**. Auth, kullanıcının girdiği "kod adı" tabanlıdır; tüm veriler `AsyncStorage`'da saklanır. Backend (`api-server`) yalnızca liderlik tablosu senkronizasyonu için kullanılır.

### Sağladığı Değerler

#### Profil ve İlerleme Verisi

| Alan | Tip | Açıklama |
|---|---|---|
| `username` | string | Kullanıcının kod adı |
| `bio` | string | Kısa tanıtım metni |
| `favoriteTopic` | string | Seçilen konu |
| `usernameLastChanged` | `string \| null` | Son değişiklik tarihi (ISO) |
| `xp` | number | Toplam XP (0'ın altına düşmez) |
| `completedMissions` | `string[]` | Tamamlanan vaka ID'leri |
| `completedLessons` | `string[]` | Tamamlanan ders ID'leri |
| `correctAnswers` | number | Toplam doğru cevap |
| `totalAnswers` | number | Toplam yanıt |
| `fakesDetected` | number | Doğru tespit edilen sahte haber sayısı |
| `badges` | `string[]` | Kazanılmış rozet ID'leri |
| `streak` | number | Günlük seri sayısı |
| `lastPlayDate` | `string \| null` | Son oynama tarihi |
| `isGuestMode` | boolean | Misafir mod (her zaman true — yerel kimlik) |

#### Hesaplanan Değerler (Otomatik)

| Değer | Açıklama |
|---|---|
| `rank` | XP'ye göre mevcut rütbe (`RANKS` tablosundan) |
| `nextRank` | Bir sonraki rütbe (son rütbedeyse `null`) |
| `xpProgress` | Mevcut rütbe içindeki ilerleme (0.0–1.0) |
| `accuracyRate` | `correctAnswers / totalAnswers × 100` |
| `dailyPlayedToday` | Bugün oynandı mı (`lastPlayDate === today`) |
| `dailyXPMultiplier` | Bugün oynanmadıysa 2, oynanmışsa 1 |
| `streakBonusEarned` | Uygulama açılışında kazanılan streak bonus XP (toast için) |
| `isAnonymous` | `isGuestMode` takma adı |
| `isLoading` | AsyncStorage yükleme tamamlandı mı |

#### Fonksiyonlar

| Fonksiyon | İmza | Açıklama |
|---|---|---|
| `setUsername` | `(name: string) => void` | Kod adını kaydeder + `usernameLastChanged` günceller |
| `updateProfile` | `({ bio?, favoriteTopic? }) => void` | Profil alanlarını günceller |
| `earnXP` | `(amount: number) => void` | XP ekler/çıkarır |
| `completeMission` | `(id, correct, xpDelta, wasFakeDetected?) => void` | Vakayı atomik günceller — XP, tamamlanma, rozet, streak tek çağrıda |
| `completeLesson` | `(id, xpDelta?) => void` | Dersi atomik günceller — XP, tamamlanma, rozet, streak tek çağrıda |
| `earnBadge` | `(badgeId: string) => void` | Manuel rozet kazandırır |
| `getBadges` | `() => BadgeData[]` | Tüm rozetleri `earned` alanıyla döndürür |
| `canChangeUsername` | `() => boolean` | Son değişiklikten 30 gün geçtiyse `true` |
| `daysUntilUsernameChange` | `() => number` | Kaç gün kaldığını döndürür |
| `signOut` | `async () => void` | AsyncStorage'ı temizler, state'i sıfırlar |

---

### Veri Kalıcılığı

**AsyncStorage key:** `@dogruluk_user_v2`

Uygulama açılışında:
1. `AsyncStorage.getItem(STORAGE_KEY)` → oyun verisi yüklenir
2. Yeni gün tespiti yapılır → streak bonus XP hesaplanır

Her veri değişikliğinde `AsyncStorage.setItem(...)` çağrılır. Bu işlem `save()` fonksiyonuyla yapılır:
```typescript
const save = async (next: UserState) => {
  setState(next);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};
```

---

### Rozet Otomasyonu

`completeMission()` içinde her tamamlamada rozet koşulları **bu çağrıdaki yeni değerlerle** kontrol edilir:

```typescript
if (!alreadyDone && newCompleted.length === 1) → "first_case"
if (!alreadyDone && newCompleted.length >= 10) → "lab_master"
if (newAccuracy >= 90 && newTotal >= 5)        → "accuracy_90"  // yeni hesaplanan doğruluk
if (newFakes >= 5)                             → "truth_seeker"
if (streak >= 3)                               → "streak_3"
if (streak >= 7)                               → "streak_7"
if (newRank.name === "Analist")                → "analyst"      // yeni hesaplanan rütbe
```

`completeLesson()` içinde:
```typescript
if (newLessons.length >= 3) → "lesson_3"
```

---

## `ContentContext.tsx` — İçerik Senkronizasyonu

Express API'den (`artifacts/api-server`) vakalar, dersler ve simülasyonları çeker. İçerik yalnızca mount sırasında bir kez yüklenir; XP değişimlerinde API tekrar çağrılmaz.

### Sağladığı Değerler

| Değer | Açıklama |
|---|---|
| `missions` | Tüm vaka listesi |
| `lessons` | Tüm ders listesi |
| `simulations` | Tüm simülasyon listesi |
| `lockedMissionIds` | Kilitli vaka ID'leri |
| `lockedLessonIds` | Kilitli ders ID'leri |
| `lockedSimulationIds` | Kilitli simülasyon ID'leri |
| `isLoading` | Veri çekme devam ediyor mu |
| `error` | API hatası varsa mesaj, yoksa `null` |

---

### Nasıl Çalışır

```
1. Mount sırasında (bir kez)
        ↓
2. Express API'den içerik çek
   GET /api/missions, /api/lessons, /api/simulations
        ↓
3. API başarısız / boş veri?
   → data/*.ts yerel statik verileri kullan
        ↓
4. userXP değiştikçe (UserContext'ten) kilitlemeyi lokal yeniden hesapla
   required_xp > userXP → lockedXxxIds'e ekle (ağ isteği yok)
```

---

### Kilit Mantığı

```typescript
const lockedMissionIds = useMemo(
  () => missions.filter(m => m.requiredXp > userXP).map(m => m.id),
  [missions, userXP]
);
```

Kilitli içeriklerin tam verisi hâlâ bellekte tutulur — sadece oynanabilirlik engellenir. UI başlık ve açıklamayı gösterir, başlatma butonu disabled yapılır.

---

### Offline Fallback

```typescript
try {
  const data = await api.getMissions();
  if (!data?.length) throw new Error("use local");
  setRawMissions(data);
} catch {
  setRawMissions(MISSIONS);  // data/missions.ts
}
```

Aynı pattern dersler ve simülasyonlar için de uygulanır.

---

## Hook Kullanımı

Her iki context için temel hook'lar:

```typescript
// UserContext
import { useUser } from "@/context/UserContext";
const { xp, username, completeMission, completeLesson, ... } = useUser();

// ContentContext
import { useContent } from "@/context/ContentContext";
const { missions, lessons, lockedMissionIds, isLoading } = useContent();
```

`useUser()` veya `useContent()`, ilgili provider dışında çağrılırsa hata fırlatır.

---

## Context'leri Tüketen Custom Hook'lar

Context'lerin üzerine inşa edilmiş, ekrana özgü iş mantığını kapsayan hook'lar:

### `useOnboardingAuth` (`hooks/useOnboardingAuth.ts`)

`useUser()` context'ini tüketir. Onboarding akışındaki adım state'ini ve yerel kod adı kaydetme mantığını yönetir. `app/onboarding.tsx` tarafından kullanılır.

```typescript
import { useOnboardingAuth } from "@/hooks/useOnboardingAuth";
const auth = useOnboardingAuth();
// auth.step, auth.codeName, auth.handleSubmit, ...
```

### `useEditProfile` (`hooks/useEditProfile.ts`)

`useUser()` context'ini tüketir. Profil formu state'ini, değişiklik tespitini ve `handleSave` mantığını yönetir. `app/edit-profile.tsx` tarafından kullanılır.

```typescript
import { useEditProfile } from "@/hooks/useEditProfile";
const profile = useEditProfile();
// profile.usernameInput, profile.hasChanges, profile.handleSave, ...
```
