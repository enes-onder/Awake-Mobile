# Kod İnceleme Geri Bildirimi — Doğruluk Dedektifi (Awake-Mobile)

> **Bu doküman kime?** Bu projeyi geliştiren AI agent'a (ve geliştiriciye) yöneliktir.
> Aşağıdaki bulgular harici bir inceleme sırasında tespit edildi. Her madde **uygulanabilir** olacak
> şekilde yazıldı: sorun, kök neden, önerilen düzeltme (kod) ve kabul kriteri içerir.
>
> **İnceleme kapsamı:** `artifacts/mobile` (Expo uygulaması), `artifacts/api-server` (Express),
> `lib/db` (Drizzle) ve dokümantasyon. Statik inceleme yapıldı; uygulama çalıştırılmadı.
> Bulguların bir kısmı kaynak kod okunarak **doğrulandı** (işaretli), bir kısmı güçlü kanıta dayalıdır.

---

## Agent için çalışma talimatı

1. Maddeleri **öncelik sırasıyla** ele al: önce `P0`, sonra `P1`, `P2`, `P3`.
2. Her madde için: önce ilgili dosyayı oku, sorunu **doğrula**, sonra düzelt.
3. Düzeltmeden sonra **kabul kriterini** kontrol et. Kabul kriteri sağlanmadan maddeyi kapatma.
4. Birden fazla maddeyi tek commit'e karıştırma; her düzeltme ayrı, açıklayıcı commit olsun.
5. Aşağıdaki kod örnekleri **yön göstericidir** — mevcut kod stiline (Türkçe yorumlar, isimlendirme) uydur.
6. Tüm düzeltmeler bittiğinde `pnpm run typecheck` çalıştır ve geçtiğini doğrula.

---

## Öncelik özeti

| # | Öncelik | Konu | Dosya |
|---|---|---|---|
| 1 | **P0** | Kazanılan görev XP'si yazılırken eziliyor (kayıp) | `hooks/useLabState.ts`, `context/UserContext.tsx` |
| 2 | **P0** | "Günlük 2× XP" bonusu hiçbir zaman tetiklenmiyor | `context/UserContext.tsx` |
| 3 | **P1** | "Sahte tespit" sayacı yanlış artıyor (rozet hatalı veriliyor) | `context/UserContext.tsx` |
| 4 | **P1** | Yanlış cevaplanan vaka kalıcı kayboluyor, tekrar denenemiyor | `context/UserContext.tsx` |
| 5 | **P1** | README gerçekte var olmayan Supabase backend'ini anlatıyor | `README.md`, `docs/`, `supabase/` |
| 6 | **P2** | İçerik her XP değişiminde gereksiz yere yeniden çekiliyor | `context/ContentContext.tsx` |
| 7 | **P2** | Profil/leaderboard endpoint'inde kimlik doğrulama yok | `api-server/src/routes/profiles.ts`, `app.ts` |
| 8 | **P2** | Rozet kontrolleri eski (stale) XP/doğruluk değerini kullanıyor | `context/UserContext.tsx` |
| 9 | **P3** | XP ilerleme çubuğu hiçbir rütbede tam %100 olmuyor | `context/UserContext.tsx` |
| 10 | **P3** | `setTimeout` zinciri unmount'ta temizlenmiyor | `hooks/useLabState.ts` |
| 11 | **P3** | Ölü kod / kullanılmayan bağımlılıklar | birden çok |
| 12 | **P3** | Erişilebilirlik (a11y) etiketleri eksik | bileşenler geneli |

---

## P0 — Oyun ekonomisini bozan hatalar

### 1. Kazanılan görev XP'si yazılırken eziliyor (XP kaybı) ✅ Doğrulandı

**Konum:** `artifacts/mobile/hooks/useLabState.ts:138-139` + `artifacts/mobile/context/UserContext.tsx:310-316, 325-376`

**Sorun:** Bir vaka tamamlandığında ardışık iki state eylemi çağrılıyor:

```js
// useLabState.ts
user.earnXP(xpEarned);              // 1) state.xp + xpEarned ile save eder
user.completeMission(id, correct);  // 2) {...state} (ESKİ xp) ile save eder
```

`earnXP` ve `completeMission`'ın ikisi de **aynı render'daki `state` closure'ına** kapanmış ve ikisi de
tam obje ile `setState` yapıyor. İkinci çağrı (`completeMission`) `{...state}` ile **eski `xp` değerini**
geri yazarak `earnXP`'in artışını eziyor. Sonuç: ekranda "+25 XP" balonu uçuyor ama AsyncStorage'a
yazılan gerçek XP artmıyor. **Kullanıcı doğru cevap verdiğinde görev ödülünü fiilen alamıyor.**

**Kök neden:** Aynı event handler içinde, ortak bir `state` snapshot'ından türeyen iki ayrı tam-obje
`setState`. React bunları batch'ler; sonuncusu kazanır.

**Önerilen düzeltme:** İki eylemi tek atomik güncellemede birleştir. `earnXP`'i çağırmayı bırak,
XP farkını `completeMission`'a parametre olarak geçir:

```ts
// UserContext.tsx — imza
completeMission: (missionId: string, correct: boolean, xpDelta: number) => void;
```

```js
// UserContext.tsx — gövde (tek save içinde xp'yi de güncelle)
const completeMission = useCallback(
  (missionId: string, correct: boolean, xpDelta: number) => {
    // ... mevcut newCompleted / newCorrect / newTotal / newBadges hesapları ...
    save({
      ...state,
      xp: Math.max(0, state.xp + xpDelta),   // ← XP burada, tek seferde
      completedMissions: newCompleted,
      correctAnswers: newCorrect,
      totalAnswers: newTotal,
      fakesDetected: newFakes,
      badges: newBadges,
      streak,
      lastPlayDate,
    });
  },
  [state, save, accuracyRate, rank]
);
```

```js
// useLabState.ts — earnXP çağrısını kaldır
- user.earnXP(xpEarned);
- user.completeMission(activeMission.id, correct);
+ user.completeMission(activeMission.id, correct, xpEarned);
```

> **Daha sağlam alternatif (uzun vade):** Tüm eylemleri `setState(prev => ...)` fonksiyonel forma
> taşı veya `useReducer`'a geçir. Böylece hiçbir eylem stale closure'dan türemez ve birden fazla
> ardışık eylem güvenle çağrılabilir. `save` yardımcısını da `(updater) => setState(prev => { ... persist ... })`
> şeklinde yeniden tasarla.

**Kabul kriteri:** Doğru cevap verildikten sonra `profile`/`index` ekranında toplam XP, `xpReward × multiplier`
kadar artmış olmalı (uygulamayı kapatıp açınca da korunmalı). `İpucu Al` (-5 XP) ile aynı turda doğru
cevap verildiğinde net XP doğru hesaplanmalı.

---

### 2. "Günlük 2× XP" bonusu hiçbir zaman tetiklenmiyor ✅ Doğrulandı

**Konum:** `artifacts/mobile/context/UserContext.tsx:233-246` (açılış) vs `:302-304` (multiplier)

**Sorun:** Uygulama açılışında, kullanıcı henüz **hiç oynamadan** streak bonusu uygulanırken
`calcStreak` çağrılıp `lastPlayDate = today` yapılıyor:

```js
// :235 — açılışta
if (loaded.username && loaded.lastLoginDate !== today) {
  const { streak, lastPlayDate } = calcStreak(loaded.lastPlayDate, loaded.streak);
  loaded = { ...loaded, xp: loaded.xp + STREAK_BONUS_XP, streak, lastPlayDate, lastLoginDate: today };
  // ...
}
```

Sonra:

```js
// :302
const dailyPlayedToday = state.lastPlayDate === todayStr();   // ← açılışta zaten true oluyor
const dailyXPMultiplier = dailyPlayedToday ? 1 : 2;           // ← bu yüzden hep 1
```

Yani giriş anında `lastPlayDate` bugüne çekildiği için, günün **ilk gerçek vakasında bile** çarpan `1`
oluyor. UI (`DailyMissionCard`) "2x XP" rozetini gösterip ödülü vermiyor → **vaat/ödül uyuşmazlığı.**

**Kök neden:** `lastPlayDate` (oyun) ile `lastLoginDate` (giriş) semantiği iç içe geçmiş. Giriş bonusu
"oynandı" durumunu işaretliyor.

**Önerilen düzeltme — net model:**

- `lastPlayDate` **yalnızca gerçek oyunda** (`completeMission`/`completeLesson`) güncellensin.
- Streak hesabı (`calcStreak`) **yalnızca gerçek oyunda** yapılsın.
- Açılış bonusu sadece düz XP + `lastLoginDate` güncellesin; `lastPlayDate`'e ve `streak`'e **dokunmasın**:

```js
// :235 — açılış bonusu (sadeleştirilmiş)
if (loaded.username && loaded.lastLoginDate !== today) {
  loaded = {
    ...loaded,
    xp: loaded.xp + STREAK_BONUS_XP,
    lastLoginDate: today,
    // lastPlayDate ve streak'e DOKUNMA
  };
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(loaded)).catch(() => {});
  setStreakBonusEarned(STREAK_BONUS_XP);
}
```

> **Dikkat (çift sayım riski):** Mevcut haliyle streak hem açılışta hem oyunda artıyordu. Yukarıdaki
> değişiklikle streak yalnızca oyunda artar; bu doğru davranıştır. Eğer "uygulamayı her gün açmak da
> streak sayılsın" isteniyorsa, o zaman streak'i SADECE açılışta hesapla ve `completeMission`'dan
> `calcStreak` çağrısını çıkar — ama ikisini birden yapma.

**Kabul kriteri:** Bugün hiç oynamamış bir kullanıcı uygulamayı açtığında ilk vakayı doğru çözünce
XP `xpReward × 2` artmalı; aynı gün ikinci vakada `× 1` olmalı. `DailyMissionCard`'daki "2x" rozeti
ile fiilen verilen ödül tutmalı. Streak günde en fazla 1 artmalı.

---

## P1 — Mantık hataları ve yanıltıcı doküman

### 3. "Sahte tespit" sayacı yanlış artıyor ✅ Doğrulandı

**Konum:** `artifacts/mobile/context/UserContext.tsx:333-335`

**Sorun:** `truth_seeker` rozeti "5 sahte haberi tespit ettin" diyor, ama sayaç her **doğru** cevapta
artıyor — gerçek bir haberi doğru şekilde "DOĞRU" işaretlemek de sayılıyor:

```js
const newFakes = correct && !alreadyDone ? state.fakesDetected + 1 : state.fakesDetected;
```

`verdict === "fake"` kontrolü yok. `completeMission` zaten verdict bilgisini almıyor.

**Önerilen düzeltme:** Vakanın verdict'ini `completeMission`'a taşı (veya hazır bir `wasFakeDetected` boolean'ı geçir):

```js
// useLabState.ts
const wasFakeDetected = correct && activeMission.verdict === "fake";
// completeMission imzasına ekle: (missionId, correct, xpDelta, wasFakeDetected)

// UserContext.tsx
const newFakes = wasFakeDetected && !alreadyDone
  ? state.fakesDetected + 1
  : state.fakesDetected;
```

**Kabul kriteri:** `fakesDetected` yalnızca `verdict === "fake"` olan bir vaka doğru çözüldüğünde artmalı.
Gerçek haberi doğru işaretlemek bu sayacı artırmamalı.

---

### 4. Yanlış cevaplanan vaka kalıcı kayboluyor

**Konum:** `artifacts/mobile/context/UserContext.tsx:327-330`

**Sorun:** `completeMission` doğru/yanlış ayırmadan vakayı `completedMissions`'a ekliyor:

```js
const newCompleted = alreadyDone
  ? state.completedMissions
  : [...state.completedMissions, missionId];   // ← yanlış cevapta da ekleniyor
```

`pendingMissions` listesi `completedMissions`'a göre filtrelendiği için (`useLabState.ts`), yanlış
cevaplanan vaka bir daha **asla** bekleyen listeye gelmiyor — kullanıcı tekrar deneyemiyor. Öğretici
bir oyunda bu muhtemelen istenmeyen bir davranış.

**Bu bir ürün kararı.** İki seçenek:

- **(A) Yanlış cevap tekrar denenebilsin (önerilen):** Vakayı yalnızca **doğru** cevapta `completedMissions`'a ekle.
  ```js
  const newCompleted = correct && !alreadyDone
    ? [...state.completedMissions, missionId]
    : state.completedMissions;
  ```
- **(B) Denendi/tamamlandı ayrımı:** Ayrı bir `attemptedMissions` listesi tut; istatistikler için onu,
  "çözüldü" durumu için `completedMissions`'ı kullan.

**Kabul kriteri:** Seçilen davranış net şekilde uygulanmalı. (A) seçilirse yanlış cevaplanan vaka
listede kalmalı ve tekrar açılabilmeli.

---

### 5. README gerçekte var olmayan Supabase backend'ini anlatıyor ✅ Doğrulandı

**Konum:** `README.md` (özellikle "Özellikler", "Kurulum", "Teknolojiler"), `docs/AUTH.md`, `docs/DATABASE.md`, `supabase/`

**Sorun:** README ve `docs/` "Supabase Auth (e-posta/şifre, magic link, anonim giriş)" ve
`@supabase/supabase-js` + `EXPO_PUBLIC_SUPABASE_URL` anlatıyor. **Gerçekte:**

- Hiçbir `package.json`'da `@supabase/supabase-js` **yok**.
- Mobil kodda tek bir Supabase/`createClient` çağrısı **yok** (auth tamamen yerel: `hooks/useOnboardingAuth.ts`
  → kullanıcı bir "kod adı" girer, `AsyncStorage`'a yazılır).
- Gerçek backend: **Express + Drizzle + Replit PostgreSQL** (`artifacts/api-server` + `lib/db`).
- `supabase/schema_and_seed.sql` (`profiles.id UUID REFERENCES auth.users(id)` + RLS) ile `lib/db`
  Drizzle şeması (`id` serbest `text`, FK/auth yok) **birbiriyle çelişiyor**; yalnızca Drizzle aktif.

`CODEBASE.md` ve `replit.md` doğru mimariyi anlatıyor — README onlarla çelişiyor.

**Önerilen düzeltme:**

1. README'deki tüm Supabase referanslarını gerçek mimariyle değiştir (Express API + Drizzle + Replit PostgreSQL;
   yerel "kod adı" tabanlı oturum).
2. Ortam değişkeni bölümünü düzelt (`EXPO_PUBLIC_SUPABASE_*` yerine gerçekte kullanılanlar: `DATABASE_URL`, `PORT`;
   ve `EXPO_PUBLIC_API_URL` notu — bkz. `CODEBASE.md`).
3. `supabase/` klasörünü ve `docs/AUTH.md`/`docs/DATABASE.md`'nin Supabase kısımlarını ya **sil** ya da
   `docs/archive/` altına taşıyıp "terk edilmiş tasarım" notu ekle.
4. Yol haritasındaki "Supabase Auth ✅" maddesini gerçek duruma göre güncelle.

**Kabul kriteri:** README'yi takip eden biri uygulamayı gerçek backend ile sıfırdan ayağa kaldırabilmeli.
Repoda Supabase'e dair, koda karşılığı olmayan hiçbir iddia kalmamalı.

---

## P2 — Performans & güvenlik

### 6. İçerik her XP değişiminde gereksiz yere yeniden çekiliyor

**Konum:** `artifacts/mobile/context/ContentContext.tsx:121-177`

**Sorun:** `useEffect` bağımlılığı `[userXP]`. Her ipucu (-5 XP) ve her cevap XP'yi değiştirdiği için,
`getMissions` + `getLessons` + `getSimulations` üçlüsü tekrar tekrar ağdan çekiliyor. Oysa kilitleme
(`locked*Ids`) zaten **client-side** hesaplanıyor; içeriği yeniden çekmeye gerek yok.

**Önerilen düzeltme:** İçeriği **bir kez** (mount'ta) çek; kilitlemeyi XP değiştikçe lokal yeniden hesapla.

```js
// 1) İçerik çekme — yalnızca mount'ta
useEffect(() => {
  let cancelled = false;
  async function fetchContent() { /* ... mevcut çekme + ham veriyi sakla ... */ }
  fetchContent();
  return () => { cancelled = true; };
}, []);   // ← userXP DEĞİL

// 2) Kilitleme — userXP veya içerik değiştikçe lokal hesap (ağ yok)
const lockedMissionIds = useMemo(
  () => rawMissions.filter(r => (r.required_xp ?? r.requiredXp ?? 0) > userXP).map(r => r.id),
  [rawMissions, userXP]
);
// lessons / simulations için aynısı
```

> İlgili: `mapMission`/`mapLesson`/`mapSimulation` içinde alanlar körlemesine `as number`/`as string`
> cast ediliyor. `required_xp`/`xp_reward` `undefined` gelirse `NaN > userXP === false` olur ve kilit
> sessizce kaybolur. Projede zaten `zod` var; ham API satırlarını şema ile doğrulamak isabetli olur.

**Kabul kriteri:** Bir oturumda XP defalarca değişse bile içerik endpoint'leri yalnızca bir kez (veya
gerçek bir yeniden yükleme gerektiğinde) çağrılmalı. Kilitler XP değiştikçe doğru güncellenmeli.

---

### 7. Profil/leaderboard endpoint'inde kimlik doğrulama yok

**Konum:** `artifacts/api-server/src/routes/profiles.ts:26-76`, `artifacts/api-server/src/app.ts:43`

**Sorun:** `POST /api/profiles/upsert` `username`'i birincil anahtar olarak kullanıyor ve **hiçbir
token/oturum/sahiplik kontrolü yok**. Herkes herhangi bir `username` ile POST atıp o kullanıcının
XP'sini/profilini ezebilir. XP zaten tamamen istemcide hesaplandığından liderlik tablosu baştan
sahtelenebilir. Ayrıca `app.ts:43` `cors()` tüm origin'lere açık.

**Bu bir tasarım kararı** (offline-öncelikli misafir oyunu için kısmen kabul edilebilir). Eğer
liderlik tablosu ciddiye alınacaksa:

- Sunucu tarafı oturum/kimlik (en azından cihaz başına imzalı bir token) ekle ve upsert'i yalnızca
  kendi profiline izin verecek şekilde kısıtla.
- XP'yi sunucuda doğrula/yeniden hesapla (kritik aksiyonları sunucuya taşı) — değilse leaderboard
  güvenilmez kalır.
- Production'da `cors()`'u izin verilen origin listesiyle sınırla.

> **İyi yanlar (korunsun):** Gizli anahtar commit'lenmemiş; `safeXP/safeStreak/safeLevel` ile sayısal
> doğrulama var; `limit` 1–100 arası sınırlanmış; log'da query string redact ediliyor;
> `pnpm-workspace.yaml`'da `minimumReleaseAge` tedarik zinciri savunması var.

**Kabul kriteri:** Karar netleşmeli. "Şimdilik güvenmiyoruz" deniyorsa bu, README/CODEBASE'de açıkça
belgelensin; aksi halde yukarıdaki kontroller eklensin.

---

### 8. Rozet kontrolleri eski (stale) XP/doğruluk değerini kullanıyor ✅ Doğrulandı

**Konum:** `artifacts/mobile/context/UserContext.tsx:347, 360`

**Sorun:** `completeMission` içinde:
- `accuracy_90` rozeti `accuracyRate >= 90` ile kontrol ediliyor; ama `accuracyRate` (`:298`) **önceki
  render'ın** değeridir — bu çağrıdaki `newCorrect`/`newTotal`'ı yansıtmaz. Rozet bir tur gecikir veya
  yanlış turun verisine göre verilir.
- `analyst` rozeti `rank.name === "Analist"` ile kontrol ediliyor; `rank` da **eski** XP'den türemiştir,
  bu çağrıda kazanılan XP'yi içermez.

**Önerilen düzeltme:** Rozet kontrollerini, bu çağrıda hesaplanan **yeni** değerlerle yap:

```js
const newAccuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0;
if (newAccuracy >= 90 && newTotal >= 5 && !newBadges.includes("accuracy_90")) {
  newBadges.push("accuracy_90");
}

const newXP = Math.max(0, state.xp + xpDelta);   // #1'deki xpDelta ile
const newRank = getRank(newXP);                  // getRank zaten dosyada mevcut
if (newRank.name === "Analist" && !newBadges.includes("analyst")) {
  newBadges.push("analyst");
}
```

> Bu madde #1 ile birlikte çözülmeli (ikisi de aynı `completeMission` fonksiyonunda).

**Kabul kriteri:** %90 doğruluğa **ulaştıran** cevapla rozet aynı anda verilmeli; Analist rütbesine
**çıkaran** XP ile `analyst` rozeti aynı anda verilmeli.

---

## P3 — İyileştirmeler

### 9. XP ilerleme çubuğu hiçbir rütbede tam %100 olmuyor

**Konum:** `artifacts/mobile/context/UserContext.tsx:294-297`

**Sorun:** `rangeSize = maxXP - minXP + 1` ve `xpProgress = min(xpInRange/rangeSize, 1)` yüzünden çubuk
bir rütbenin son XP'sinde bile tam dolmuyor (ör. Çaylak 149 XP → `149/150 ≈ %99.3`). Ayrıca son rütbe
"Baş Dedektif"te (1500+) çubuk hep %0 görünüyor.

**Önerilen düzeltme:** İlerlemeyi bir sonraki rütbeye göre hesapla:

```js
const span = nextRank ? nextRank.minXP - rank.minXP : 1;
const xpProgress = nextRank ? Math.min((state.xp - rank.minXP) / span, 1) : 1;
```

**Kabul kriteri:** Sonraki rütbe eşiğine ulaşıldığında çubuk tam %100 olmalı; maksimum rütbede dolu görünmeli.

---

### 10. `setTimeout` zinciri unmount/erken çıkışta temizlenmiyor

**Konum:** `artifacts/mobile/hooks/useLabState.ts:158-161`

**Sorun:** Karar sonrası 2300ms + 380ms iç içe `setTimeout` ile result ekranına geçiliyor; `clearTimeout`
yok. Kullanıcı bu ~2.7sn içinde geri dönerse zamanlayıcı yine de `setLabState("result")` çağırıp ekranı
zorla değiştirir (state sıçraması). Ayrıca 2300ms, `CelebrationOverlay` süresine sabit kodlanmış (kırılgan).

**Önerilen düzeltme:** Zamanlayıcıyı `useRef`'te tut ve `onBack`/unmount'ta temizle:

```js
const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
// kurarken: timersRef.current.push(setTimeout(...));
// temizlerken (onBack ve useEffect cleanup): timersRef.current.forEach(clearTimeout);
```

**Kabul kriteri:** Animasyon sürerken geri dönüldüğünde ekran result'a sıçramamalı.

---

### 11. Ölü kod / kullanılmayan bağımlılıklar ✅ Doğrulandı

- `artifacts/mobile-app/` — Replit Agent'ın bıraktığı boş iskelet ("Replit Agent is building..." yer
  tutucusu, 9 dosya). Hiçbir workflow/config bundan bahsetmiyor. **Sil.**
- `@workspace/api-client-react` — `mobile` (ve `mobile-app`) `package.json`'unda bağımlılık olarak var
  ama kaynak kodda **hiç import edilmiyor** (uygulama elle yazılmış `lib/api.ts`'i kullanıyor).
  Ya kullan ya da bağımlılıktan çıkar.
- `supabase/` — terk edilmiş mimari (bkz. #5).
- `scripts/package.json` mevcut olmayan `src/hello.ts`'e referans veriyor (çalışmaz). Kaldır.
- `artifacts/mockup-sandbox/` — Replit canvas önizleme aracı; uygulamanın parçası değil. (Bilinçli
  tutuluyorsa kalsın; değilse temizlenebilir.)

**Kabul kriteri:** `pnpm install` ve `pnpm run typecheck` temizlikten sonra da sorunsuz geçmeli.

---

### 12. Erişilebilirlik (a11y) etiketleri eksik

**Konum:** `components/swipe/VerdictButtons.tsx`, `components/SimulationPlayer.tsx` (kapatma X butonu),
`app/(tabs)/profile.tsx` ve genel olarak `TouchableOpacity` kullanımları.

**Sorun:** Etkileşimli öğelerde `accessibilityRole="button"` ve anlamlı `accessibilityLabel` yok.
"DOĞRU"/"YANLIŞ" karar butonları, salt-ikon kapatma butonu ve emoji ikonları (🏆, 🔥) ekran okuyucu için
erişilemez. Swipe-kartı tamamen jest tabanlı; etiketli buton alternatifleri de etiketsiz.

**Önerilen düzeltme:** Tüm dokunulabilir öğelere `accessibilityRole` + `accessibilityLabel` ekle;
salt-ikon butonlara açıklayıcı etiket; dokunma hedeflerini ≥44pt yap.

**Kabul kriteri:** VoiceOver/TalkBack ile kritik akış (vaka çözme, simülasyon) baştan sona kullanılabilmeli.

---

## Tamamlandığında doğrulama

```bash
# 1) Tip kontrolü (kökten)
pnpm run typecheck

# 2) Manuel akış kontrolü (P0/P1 için)
#    - Yeni kod adıyla başla → ilk vakayı doğru çöz → profilde XP'nin xpReward×2 arttığını gör
#    - Aynı gün ikinci vakada çarpanın ×1 olduğunu gör
#    - İpucu (-5) + doğru cevap aynı turda → net XP doğru mu
#    - Yanlış cevaplanan vaka listede kalıyor mu (#4 kararına göre)
#    - Gerçek haberi doğru işaretle → fakesDetected ARTMAMALI (#3)
#    - Uygulamayı kapat/aç → XP korunuyor mu
```

---

## Genel değerlendirme

Mimari disiplin (tek-sorumluluk bileşenler, iş mantığının hook'lara çekilmesi, kapsamlı Türkçe yorumlar,
offline-öncelikli fallback) **güçlü**. Asıl risk; (a) state güncelleme modelindeki stale-closure kaynaklı
P0 hataları ve (b) dokümantasyon-kod uyumsuzluğu. P0/P1 maddeleri kapatıldığında uygulamanın çekirdek
oyun döngüsü güvenilir hale gelir.

*Bu doküman harici bir inceleme çıktısıdır; öneriler yön göstericidir, mevcut kod stiline uyarlanmalıdır.*
