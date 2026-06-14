# Context'ler — Doğruluk Dedektifi

Uygulama durumu iki React Context ile yönetilir. Her ikisi de `artifacts/mobile/context/` içindedir.

---

## `UserContext.tsx` — Kullanıcı ve Auth Durumu

Uygulamadaki en kritik dosya. Hem oyun verilerini hem de kimlik doğrulama (Supabase Auth) durumunu yönetir.

### Sağladığı Değerler

#### Auth

| Değer/Fonksiyon | Tip | Açıklama |
|---|---|---|
| `authUser` | `User \| null` | Supabase oturumundaki kullanıcı nesnesi |
| `session` | `Session \| null` | Supabase oturum nesnesi (token vb.) |
| `isAnonymous` | `boolean` | Kullanıcı anonim mi (`authUser?.is_anonymous`) |
| `signOut()` | `async () => void` | Oturumu kapatır, yerel veriyi siler |
| `signInAnonymously()` | `async () => { error }` | Anonim oturum açar |

#### Oyun Verisi

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

#### Hesaplanan Değerler (Otomatik)

| Değer | Açıklama |
|---|---|
| `rank` | XP'ye göre mevcut rütke (`RANKS` tablosundan) |
| `nextRank` | Bir sonraki rütke (son rütkedeyse `null`) |
| `xpProgress` | Mevcut rütke içindeki ilerleme (0.0–1.0) |
| `accuracyRate` | `correctAnswers / totalAnswers × 100` |
| `dailyPlayedToday` | Bugün oynandı mı |
| `dailyXPMultiplier` | Bugün oynanmadıysa 2, oynanmışsa 1 |
| `isLoading` | İlk yükleme tamamlandı mı |

#### Fonksiyonlar

| Fonksiyon | Açıklama |
|---|---|
| `setUsername(name)` | Kod adını kaydeder + `usernameLastChanged` günceller |
| `updateProfile({ bio, favoriteTopic })` | Profil alanlarını günceller |
| `earnXP(amount)` | XP ekler/çıkarır |
| `completeMission(id, correct)` | Vakayı tamamlar, rozet/streak/XP günceller |
| `completeLesson(id)` | Dersi tamamlar, rozet/streak/XP günceller |
| `earnBadge(badgeId)` | Manuel rozet kazandırır |
| `canChangeUsername()` | Son değişiklikten 30 gün geçtiyse `true` |
| `daysUntilUsernameChange()` | Kaç gün kaldığını döndürür |
| `getBadges()` | Tüm rozetleri `earned` alanıyla döndürür |

---

### Veri Kalıcılığı

**AsyncStorage key:** `@dogruluk_user_v2`

Uygulama açılışında:
1. `AsyncStorage.getItem(STORAGE_KEY)` → oyun verisi yüklenir
2. `supabase.auth.getSession()` → oturum kontrol edilir

Her veri değişikliğinde `AsyncStorage.setItem(...)` çağrılır. Bu işlem `save()` fonksiyonuyla yapılır:
```typescript
const save = async (next: UserState) => {
  setState(next);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
};
```

---

### Auth Durumu Senkronizasyonu

`onAuthStateChange` dinleyicisi tüm oturum değişikliklerini (giriş, çıkış, token yenileme) yakalar:

```typescript
supabase.auth.onAuthStateChange((_event, newSession) => {
  setSession(newSession);
  setAuthUser(newSession?.user ?? null);
});
```

---

### Rozet Otomasyonu

`completeMission()` içinde her tamamlamada rozet koşulları kontrol edilir:

```typescript
if (!alreadyDone && newCompleted.length === 1) → "first_case"
if (!alreadyDone && newCompleted.length >= 10) → "lab_master"
if (accuracyRate >= 90 && newTotal >= 5)        → "accuracy_90"
if (newFakes >= 5)                              → "truth_seeker"
if (streak >= 3)                                → "streak_3"
if (streak >= 7)                                → "streak_7"
if (rank.name === "Analist")                    → "analyst"
```

`completeLesson()` içinde:
```typescript
if (newLessons.length >= 3) → "lesson_3"
```

---

## `ContentContext.tsx` — İçerik Senkronizasyonu

Supabase'den vakalar, dersler ve simülasyonları çeker. XP kilitleme mantığını uygular.

### Sağladığı Değerler

| Değer | Açıklama |
|---|---|
| `missions` | Tüm vaka listesi |
| `lessons` | Tüm ders listesi |
| `simulations` | Tüm simülasyon listesi |
| `lockedMissionIds` | Kilitli vaka ID'leri |
| `lockedLessonIds` | Kilitli ders ID'leri |
| `lockedSimulationIds` | Kilitli simülasyon ID'leri |
| `loading` | Veri çekme devam ediyor mu |

---

### Nasıl Çalışır

```
1. userXP değiştiğinde (UserContext'ten alınır)
        ↓
2. Supabase'den içerik çek
   (missions, lessons, simulations tabloları)
        ↓
3. Her içeriğin required_xp alanını userXP ile karşılaştır
   required_xp > userXP → lockedXxxIds'e ekle
        ↓
4. Supabase başarısız / boş veri?
   → data/*.ts yerel statik verileri kullan
```

---

### Kilit Mantığı

```typescript
const lockedMissionIds = missions
  .filter(m => m.required_xp > userXP)
  .map(m => m.id);
```

Kilitli içeriklerin tam verisi hâlâ bellekte tutulur — sadece oynanabilirlik engellenir. UI başlık ve açıklamayı gösterir, başlatma butonu disabled yapılır.

---

### Offline Fallback

```typescript
try {
  const { data, error } = await supabase.from("missions").select("*");
  if (error || !data?.length) throw new Error("use local");
  setMissions(data);
} catch {
  setMissions(localMissions);  // data/missions.ts
}
```

Aynı pattern dersler ve simülasyonlar için de uygulanır.

---

## Hook Kullanımı

Her iki context için tek hook'lar vardır:

```typescript
// UserContext
import { useUser } from "@/context/UserContext";
const { xp, username, authUser, completeMission, ... } = useUser();

// ContentContext
import { useContent } from "@/context/ContentContext";
const { missions, lessons, lockedMissionIds, loading } = useContent();
```

`useUser()` veya `useContent()`, ilgili provider dışında çağrılırsa hata fırlatır.
