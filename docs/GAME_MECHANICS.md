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

### Streak Rozet Eşikleri

- 3 günlük seri → `streak_3` rozeti
- 7 günlük seri → `streak_7` rozeti

---

## İçerik Kilitleme (XP Kapısı)

Her vaka, ders ve simülasyonun bir `required_xp` alanı var. `ContentContext` bu alanı kullanıcının mevcut XP'siyle karşılaştırır:

```
required_xp ≤ kullanıcının XP'si → İçerik açık
required_xp > kullanıcının XP'si → İçerik kilitli
```

Kilitli içerikler `lockedMissionIds`, `lockedLessonIds`, `lockedSimulationIds` listelerine eklenir. UI bu listeleri kontrol ederek kilitleri gösterir.

**Önemli:** Kilitli içeriklerin tam içeriği hâlâ Supabase'den çekilir — sadece oynanabilirlik engellenir, başlık ve açıklama görünür.

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

Tüm oyun verisi `AsyncStorage`'a `@dogruluk_user_v2` anahtarıyla JSON olarak kaydedilir. Supabase'e senkronizasyon henüz yapılmamaktadır — veri yalnızca cihazdadır.

Supabase'deki `user_mission_progress`, `user_lesson_progress`, `user_simulation_progress` tabloları ilerideki bulut senkronizasyonu için hazırdır.
