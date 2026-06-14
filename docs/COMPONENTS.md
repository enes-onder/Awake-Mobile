# Bileşenler — Doğruluk Dedektifi

Tüm yeniden kullanılabilir UI parçaları `artifacts/mobile/components/` içindedir.

---

## `SwipeCard.tsx` — Tinder-Stili Haber Kartı

Vaka analizinin çekirdeği. Bir sosyal medya paylaşımını gerçekmiş gibi gösterir.

### Props

```typescript
interface SwipeCardProps {
  mission: Mission;
  onSwipe: (direction: "left" | "right") => void;
  hintsUsed: number;
  onHintUse: () => void;
}
```

### Gösterdiği Bilgiler

- Hesap adı + `@handle`
- Zaman damgası
- Paylaşım metni
- Beğeni / paylaşım sayısı
- Platform etiketi: `Twitter` / `Instagram` / `WhatsApp` / `Haber` / `Telegram`
- Varsa fotoğraf etiketi

### Gesture Sistemi

`react-native-gesture-handler`'ın `PanGesture`'ı kullanılır:
- **Sağa sürükle** → "DOĞRU" etiketi (yeşil)
- **Sola sürükle** → "YANLIŞ" etiketi (kırmızı)
- Sürükleme sırasında kart eğilir ve etiket belirir
- Bırakıldığında threshold'u geçmişse `onSwipe` callback tetiklenir

### İpucu Sistemi

Her basışta `hintsUsed` artırılır ve sıradaki ipucu gösterilir. Her ipucu -5 XP düşürür (`onHintUse` callback'i üst bileşen yönetir).

### Responsive

`useWindowDimensions` ile anlık genişlik okunur, inline ölçek hesabı:
```typescript
const _rScale = Math.min(Math.max(width / 390, 0.9), 1.2);
const rfs = (base: number) => Math.round(base * _rScale);
const rsp = (base: number) => Math.round(base * _rScale);
```
Post metni, hesap adı, ipucu yazıları ve buton padding'leri ölçeklenir.

### Kritik Kısıtlama

> Bu bileşeni asla bir `ScrollView` içine koymayın. Gesture çakışması yaşanır ve swipe çalışmaz. Bileşeni saran container `flex: 1` ve `justifyContent: "center"` kullanmalıdır.

---

## `SimulationPlayer.tsx` — Simülasyon Oynatıcı

Adım adım senaryo oyununu yöneten bileşen.

### Props

```typescript
interface SimulationPlayerProps {
  simulation: Simulation;
  onComplete: (totalXP: number) => void;
  onExit: () => void;
}
```

### İki Tür Adım

| Tür | Davranış |
|---|---|
| `narrative` | Sadece metin gösterilir, "Devam Et" butonu ile ilerle |
| `choice` | 2–3 seçenek butonu; seçim sonrası doğru/yanlış renklendirme + açıklama; "Devam Et" ile ilerle |

**Çoklu doğru:** Bir adımda birden fazla `isCorrect: true` seçenek olabilir.

**XP toplama:** Her `choice` adımında seçilen seçeneğin `xpReward` değeri toplanır. Tüm adımlar bitince `onComplete(totalXP)` çağrılır.

### Responsive

`useResponsive` hook'u üst bileşenden geçirilir veya içeride kullanılır.

---

## `CelebrationOverlay.tsx` — Kutlama/Hata Animasyonu

Swipe sonrasında tam ekranı kaplayan anlık animasyon.

### Props

```typescript
interface CelebrationOverlayProps {
  visible: boolean;
  correct: boolean;
  subMessage?: string;
  onDone: () => void;
}
```

### Davranış

- **Doğru:** Yeşil arka plan + "Doğru Tespit!" başlığı
- **Yanlış:** Kırmızı arka plan + "Yanlış Tahmin" başlığı
- `subMessage` ile ekstra açıklama eklenebilir (ör: kazanılan XP)
- 1.5 saniye sonra otomatik `onDone()` tetiklenir

---

## `XPFloater.tsx` — Uçan XP Baloncuğu

Ekranın ortasında beliren, yukarı doğru süzülüp kaybolan "+N XP" animasyonu.

### Props

```typescript
interface XPFloaterProps {
  amount: number;   // Gösterilecek XP miktarı (pozitif veya negatif)
  onDone: () => void;
}
```

Pozitif değerlerde yeşil/sarı, negatif değerlerde kırmızı renk kullanılır. Animasyon bitince `onDone()` çağrılır, üst bileşen görünürlüğü sıfırlar.

---

## `XPBar.tsx` — Rütke İlerleme Çubuğu

Mevcut rütke aralığındaki XP yüzdesini görsel çubuk olarak gösterir.

### Props

```typescript
interface XPBarProps {
  xp: number;
  rank: Rank;
  nextRank: Rank | null;
}
```

- **Sol:** Mevcut rütke adı
- **Sağ:** Bir sonraki rütke adı (son rütkedeyse "Maksimum")
- **Çubuk doluluk oranı:** `(xp - rank.minXP) / (rank.maxXP - rank.minXP)`

---

## `RankBadge.tsx` — Rütke Rozeti

Rütkeyi ikon + isim + renkli arka planla gösterir.

### Props

```typescript
interface RankBadgeProps {
  rank: Rank;
  size?: "sm" | "md";
}
```

| Boyut | Kullanım yeri |
|---|---|
| `sm` (küçük) | Karargah header'ı |
| `md` (orta) | Profil hero kartı |

Her rütkenin kendine özgü rengi var (Çaylak=gri, Araştırmacı=yeşil, Analist=mavi, Kıdemli=mor, Baş Dedektif=turuncu).

---

## `BadgeCard.tsx` — Rozet Kartı

Akademi ekranının "Rozetler" sekmesinde kullanılır. 2 sütunlu ızgarada gösterilir.

### Props

```typescript
interface BadgeCardProps {
  badge: BadgeData;  // { id, name, description, icon, color, earned }
}
```

- `earned: true` → Renkli ikon, tam opaklık
- `earned: false` → Gri ikon, %40 opaklık, "Kilitli" overlay

---

## `MissionCard.tsx` — Görev Kartı

Haber Lab listesinde her görevi gösteren kart. İki modda çalışır.

### Props

```typescript
interface MissionCardProps {
  mission: Mission;
  completed: boolean;
  locked?: boolean;
  compact?: boolean;
  onPress: () => void;
}
```

| Mod | Kullanım | İçerik |
|---|---|---|
| Normal (`compact: false`) | Lab listesi | Görev tipi rozeti, zorluk, başlık, açıklama, kategori, XP |
| Compact (`compact: true`) | Karargah yatay listesi | Başlık + zorluk + XP |

**Tamamlanmış görevler:** Yeşil kenarlık + yeşil tik ikonu + %70 opaklık.

**Görev tipi ikonları:** `photo`=resim, `headline`=metin, `quote`=mesaj, `stats`=grafik, `video`=video

**Zorluk renkleri:** 1=yeşil (Kolay), 2=turuncu (Orta), 3=kırmızı (Zor)

---

## `ErrorBoundary.tsx` — Global Hata Yakalayıcı

React class component tabanlı hata sınırı.

Uygulama herhangi bir yerde beklenmedik çökme yaşarsa beyaz ekran yerine `ErrorFallback` bileşenini render eder. `getDerivedStateFromError` ile hatayı yakalar, isteğe bağlı `onError` callback'i destekler.

---

## `ErrorFallback.tsx` — Hata Ekranı UI'ı

`ErrorBoundary` aktifleşince gösterilen ekran.

- **Kullanıcı görür:** "Something went wrong" + "Try Again" butonu
- **Geliştirici görür (sadece dev modunda):** "!" ikonu → tıklanınca hata mesajı + stack trace modal
- "Try Again" → `expo`'nun `reloadAppAsync()` ile uygulamayı yeniden başlatır

---

## `KeyboardAwareScrollViewCompat.tsx` — Klavye Uyumlu Scroll

Platform adaptörü.

- **Web'de:** `ScrollView` kullanır (KeyboardAwareScrollView web'de çalışmaz)
- **Native'de:** `KeyboardAwareScrollView` kullanır

Klavye açıldığında içeriğin klavye üstünde kalmasını sağlar. İki platform arasındaki API farkını gizler, üst bileşenler platform kontrolü yazmak zorunda kalmaz.
