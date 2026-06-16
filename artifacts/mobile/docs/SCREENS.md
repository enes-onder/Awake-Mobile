# Ekranlar (Screens)

## Tab Ekranları

### Karargah (`app/(tabs)/index.tsx`)
Ana sayfa. Kullanıcının günlük durumunu ve görevlerini gösterir.

**Orchestrator satırı:** ~80 satır  
**Bağımlılıklar:**
- `StreakBonusToast` — Günlük seri bonusu toast bildirimi (üstten kayar)
- `StreakCard` — Mevcut seri durumu (devam ediyor / uyarı)
- `XPProgressCard` — Rütbe ilerleme çubuğu + XP sayacı
- `StatsRow` — 3 istatistik kutusu (çözülen görev / doğruluk / XP)
- `DailyMissionCard` — Günün öne çıkan görevi (2x XP bonusu)
- `ActiveMissionsList` — Yatay kaydırmalı aktif vakalar

**Context:**
- `useUser()` — xp, rank, streak, dailyPlayedToday, streakBonusEarned, completedMissions, accuracyRate
- `useContent()` — missions listesi

---

### Görev Laboratuvarı (`app/(tabs)/lab.tsx`)
Görevlerin listelendiği ve oynanabildiği ekran.

**Ana bileşenler:** `SwipeCard`, `MissionResultModal`

---

### Öğren (`app/(tabs)/learn.tsx`)
Simülasyonlar ve dersler.

**Ana bileşenler:** `SimulationPlayer`, ders kartları

---

### Profil (`app/(tabs)/profile.tsx`)
Kullanıcı profili, rozetler, ayarlar.

---

## Stack Ekranları

### Liderlik Tablosu (`app/leaderboard.tsx`)
Tüm oyuncuların XP sıralaması.

**Orchestrator satırı:** ~75 satır  
**Bağımlılıklar:**
- `useLeaderboard` hook — veri çekme + retry mantığı
- `PodiumCard` — Top-3 podyum (FlatList header olarak)
- `LeaderRow` — Her oyuncu satırı (giriş animasyonu)
- `LoadingState` / `ErrorState` / `EmptyState` — Yükleme, hata, boş durumları

**Veri:** `api.getLeaderboard(50)` → `LeaderboardEntry[]`

---

### Onboarding (`app/onboarding.tsx`)
İlk açılışta kullanıcı adı alma.

---

## Navigasyon

```
Root Stack
  ├── (tabs)/
  │     ├── index        # Karargah
  │     ├── lab          # Görev Lab
  │     ├── learn        # Öğren
  │     └── profile      # Profil
  ├── leaderboard
  └── onboarding
```
