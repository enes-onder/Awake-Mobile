# Oyun Mekaniği — Doğruluk Dedektifi

---

## XP Sistemi

Her başarılı eylem XP (Deneyim Puanı) kazandırır. XP hiçbir zaman 0'ın altına düşmez.

### XP Kazanma/Kaybetme Tablosu

| Eylem | XP Değişimi |
|---|---|
| Vakayı **doğru** çöz | `+xpReward × günlük_çarpan` |
| Vakayı **yanlış** çöz | `-(xpReward × 0.4)` (yuvarlanır) |
| İpucu kullan | `−5 XP` (her ipucu ayrı düşer) |
| Ders tamamla | `+xpReward` (dersteki değere göre değişir) |
| Quiz sorusunu doğru yanıtla | `+10 XP` |
| Quiz sorusunu yanlış yanıtla | `−10 XP` |
| Simülasyonda doğru seçim | `+seçeneğin xpReward değeri` |
| Simülasyonda yanlış seçim | `0 XP` (ceza yok) |
| **Günlük giriş streak bonusu** | `+10 XP` (her gün ilk açılışta) |

### Günlük 2× Bonus

Eğer bugün henüz hiçbir eylem yapılmamışsa (`dailyPlayedToday === false`), ilk eylemin XP ödülü **iki katı** verilir.

```typescript
dailyXPMultiplier: dailyPlayedToday ? 1 : 2
```

Bugün oynanıp oynanmadığı `lastPlayDate` ile takip edilir.

---

## Rütbe Sistemi

Kullanıcı XP kazandıkça 5 rütke kademesini geçer. Rütbe otomatik olarak XP'ye göre hesaplanır — manuel güncelleme gerekmez.

| Rütbe | Minimum XP | Maksimum XP | Renk |
|---|---|---|---|
| Çaylak | 0 | 149 | Gri (#8892A4) |
| Araştırmacı | 150 | 399 | Yeşil (#00C851) |
| Analist | 400 | 799 | Mavi (#2B7FFF) |
| Kıdemli Analist | 800 | 1499 | Mor (#9B59B6) |
| Baş Dedektif | 1500 | ∞ | Turuncu (#FF9500) |

### Dijital Sertifika

800 XP eşiğine (Kıdemli Analist) ulaşınca profil ekranında "Dijital Sertifika Kazanıldı" mesajı ve yeşil onay ikonu görünür. Bu eşiğe kadar kaç XP kaldığı ilerleme çubuğuyla gösterilir.

### Rütke Hesabı (UserContext)

```typescript
const getRank = (xp: number): Rank => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].minXP) return RANKS[i];
  }
  return RANKS[0];
};
```

---

## Rozet Sistemi

8 rozet var. Her rozet bir kez kazanılır, kaybolmaz. `UserContext` içindeki `badges: string[]` dizisinde rozet ID'leri saklanır.

| Rozet ID | Görünen Ad | Ne Zaman Kazanılır |
|---|---|---|
| `first_case` | İlk Vaka | İlk misyon tamamlandığında |
| `streak_3` | Ateş Hattı | 3 günlük oyun serisi |
| `streak_7` | Haftalık Seri | 7 günlük oyun serisi |
| `lab_master` | Lab Ustası | 10 misyon tamamlandığında |
| `truth_seeker` | Gerçek Avcısı | 5 sahte haberi doğru tespit |
| `analyst` | Analist Rozeti | Analist rütbesine ulaşıldığında |
| `accuracy_90` | Keskin Nişancı | %90+ doğruluk, minimum 5 cevap |
| `lesson_3` | Öğrenci | 3 ders tamamlandığında |

### Rozet Kontrolü

Rozetler her `completeMission()` çağrısında otomatik kontrol edilir. Bir rozet kazanılmışsa `badges` dizisine eklenir ve `AsyncStorage`'a kaydedilir.

---

## Seri (Streak) Sistemi

Her oynama gününde seri artar. Bir gün atlanırsa seri 1'e sıfırlanır.

### Hesaplama Mantığı

```typescript
function calcStreak(lastPlayDate, currentStreak) {
  const today = todayStr();       // new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastPlayDate === today)     return { streak: currentStreak, lastPlayDate: today };
  if (lastPlayDate === yesterday) return { streak: currentStreak + 1, lastPlayDate: today };
  else                            return { streak: 1, lastPlayDate: today };
}
```

Seri, `completeMission()` ve `completeLesson()` çağrılarında güncellenir.

### Günlük Login Streak Bonusu (YENİ)

Uygulama her gün ilk açıldığında (`lastLoginDate !== today`) otomatik olarak:
- Streak `calcStreak()` mantığıyla güncellenir
- Kullanıcıya `+10 XP` ödül verilir
- `lastLoginDate` bugünün tarihi olarak kaydedilir
- Ekranda parlayan bir "🔥 Günlük Seri Bonusu! +10 XP" toast bildirimi gösterilir

Bu işlem `UserContext`'in `useEffect` yüklemesinde gerçekleşir; aynı gün içinde ikinci açılışta tekrarlanmaz.

### Streak Rozet Eşikleri

- 3 günlük seri → `streak_3` rozeti
- 7 günlük seri → `streak_7` rozeti

---

## Liderlik Tablosu (Global Leaderboard) (YENİ)

### Mimari

Kullanıcı profilleri PostgreSQL veritabanındaki `profiles` tablosuna senkronize edilir. Senkronizasyon şu durumlarda tetiklenir:

- Kullanıcı adı ilk kez ayarlandığında (onboarding)
- Görev tamamlandığında
- Ders tamamlandığında
- XP değişimlerinde

Senkronizasyon `api.syncProfile()` ile `POST /api/profiles/upsert` endpointine fire-and-forget olarak yapılır.

### Sıralama Kuralları

- Tüm oyuncular toplam XP'ye göre **büyükten küçüğe** sıralanır
- İlk 3 oyuncu için özel madalya gösterilir:
  - 🥇 1. sıra: Altın
  - 🥈 2. sıra: Gümüş
  - 🥉 3. sıra: Bronz
- Kullanıcının kendi satırı mavi renkle vurgulanır ve "#N (sen)" etiketi gösterilir
- Her satırda: sıra, kullanıcı adı, rütbe etiketi, streak ve XP gösterilir

### API Endpointleri

| Endpoint | Metod | Açıklama |
|---|---|---|
| `/api/profiles/upsert` | POST | Profili oluştur veya güncelle |
| `/api/leaderboard` | GET | XP'ye göre sıralı ilk 50 oyuncu |

### Erişim

Profil ekranındaki "🏆 Liderlik Tablosu" kartına basılarak `/leaderboard` rotasına yönlendirilir.

---

## İçerik Kilitleme (XP Kapısı)

Her vaka, ders ve simülasyonun bir `required_xp` alanı var. `ContentContext` bu alanı kullanıcının mevcut XP'siyle karşılaştırır:

```
required_xp ≤ kullanıcının XP'si → İçerik açık
required_xp > kullanıcının XP'si → İçerik kilitli
```

Kilitli içerikler `lockedMissionIds`, `lockedLessonIds`, `lockedSimulationIds` listelerine eklenir. UI bu listeleri kontrol ederek kilitleri gösterir.

---

## Doğruluk Oranı

```typescript
accuracyRate = totalAnswers > 0
  ? Math.round((correctAnswers / totalAnswers) * 100)
  : 0;
```

`correctAnswers` sadece vakalardaki doğru cevapları sayar (quiz soruları dahil değil).

---

## Oyun Verisinin Kaydedilmesi

Tüm oyun verisi `AsyncStorage`'a `@dogruluk_user_v2` anahtarıyla JSON olarak kaydedilir.

Ek olarak, her XP/streak değişikliğinde kullanıcı profili `POST /api/profiles/upsert` ile veritabanına senkronize edilir. Bu sayede global leaderboard güncel kalır.

### Persisted State Alanları

| Alan | Açıklama |
|---|---|
| `username` | Kullanıcı adı |
| `xp` | Toplam XP |
| `streak` | Güncel seri sayısı |
| `lastPlayDate` | Son oynama günü (streak hesabı için) |
| `lastLoginDate` | Son giriş günü (login bonus için) |
| `completedMissions` | Tamamlanan vaka ID listesi |
| `completedLessons` | Tamamlanan ders ID listesi |
| `badges` | Kazanılan rozet ID listesi |
| `correctAnswers` | Toplam doğru cevap sayısı |
| `totalAnswers` | Toplam cevap sayısı |
| `fakesDetected` | Tespit edilen sahte haber sayısı |
