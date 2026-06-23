# P0 Fix Report

## Durum
P0 oyun ekonomisi düzeltmeleri uygulandı.

## Değiştirilen dosyalar
- `artifacts/mobile/context/UserContext.tsx`
- `artifacts/mobile/hooks/useLabState.ts`
- `artifacts/mobile/app/(tabs)/academy.tsx`
- `artifacts/mobile/components/swipe/VerdictButtons.tsx`

## Yapılan ana düzeltmeler

### 1. Mission XP state ezilmesi
- `useLabState.ts` içindeki ardışık `earnXP()` + `completeMission()` akışı kaldırıldı.
- `completeMission()` artık `xpDelta` alıyor.
- XP, completedMissions, stats, badges, streak ve lastPlayDate tek atomik state güncellemesinde hesaplanıyor.

### 2. Günlük 2× XP
- Startup akışında `lastPlayDate` ve `streak` değiştirilmemeye başlandı.
- `lastLoginDate` sadece günlük giriş bonusu için kullanılıyor.
- `lastPlayDate` sadece gerçek oyun aktivitesi sonrası değişiyor.
- İlk gerçek aktivite 2×, aynı gün sonraki aktiviteler 1× olacak şekilde düzeltildi.

### 3. Akademi ders tamamlama
- `completeLesson()` artık opsiyonel `xpDelta` alıyor.
- `completeLesson()` + `earnXP()` ardışık state ezilmesi engellendi.
- Ders tamamlanması ve XP artışı tek atomik state güncellemesinde yapılıyor.

### 4. Typecheck
- `pnpm run typecheck` çalıştırıldı.
- Typecheck temiz geçti.
- `VerdictButtons.tsx` içinde typecheck'i bozan eski tip hatası düzeltildi.

## Notlar
- `VerdictButtons.tsx` değişikliği P0 kapsamında planlanan bir UI değişikliği değildi; typecheck'i geçirmek için zorunlu teknik düzeltme olarak yapıldı.
- P1'e geçmeden önce `FEEDBACK.md` dosyasının kökte mevcut olduğu doğrulanmalıdır.
