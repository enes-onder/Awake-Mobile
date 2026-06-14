# Responsive Tasarım Sistemi — Doğruluk Dedektifi

Uygulama küçük telefon ekranlarından tablet ve web'e kadar tutarlı görünmek için merkezi bir `useResponsive` hook'u kullanır.

---

## `hooks/useResponsive.ts` — Paylaşımlı Hook

Tüm ekranlar ve bazı bileşenler bu tek hook'u içe aktarır:

```typescript
import { useResponsive } from "@/hooks/useResponsive";

const r = useResponsive();
```

### Döndürdüğü Değerler

| Değer | Tip | Açıklama |
|---|---|---|
| `width` | `number` | Mevcut ekran genişliği (px) |
| `isTablet` | `boolean` | Genişlik ≥ 600px ise `true` |
| `isDesktop` | `boolean` | Genişlik ≥ 1024px ise `true` |
| `hp(n)` | `function` | Yatay padding hesabı (`n × scale`) |
| `maxW` | `number` | İçerik maksimum genişliği (tablet: 640, diğer: genişlik) |
| `fs(base)` | `function` | Ölçekli font boyutu |
| `sp(base)` | `function` | Ölçekli boşluk/padding değeri |
| `scale` | `number` | Ham ölçek çarpanı (0.9 – 1.25) |

### Ölçek Hesabı

```typescript
const scale = Math.min(Math.max(width / 390, 0.9), 1.25);
```

- **390px** referans genişliği (iPhone 14 Pro)
- **0.9** alt sınır — küçük ekranlarda çok küçülmemesi için
- **1.25** üst sınır — büyük tablette çok büyümemesi için

Örnek: 320px genişlikte scale = 0.9 / 428px genişlikte scale = 1.098 / 768px tablette scale = 1.25 (sabit)

---

## İçerik Ortalama

Tablet ve web genişliklerinde içerik genişliğini sınırlamak için `maxWidth` + `alignSelf: "center"`:

```typescript
// Her ekranda kullanılan pattern
<View style={{
  width: "100%",
  maxWidth: r.maxW,      // tablet: 640px, telefon: ekran genişliği
  alignSelf: "center",
}}>
```

---

## Hangi Dosyalar Hook'u Kullanıyor

| Dosya | Hangi değerleri kullanıyor |
|---|---|
| `app/(tabs)/index.tsx` | `r.hp`, `r.maxW`, `r.fs`, `r.isTablet` |
| `app/(tabs)/profile.tsx` | `r.hp`, `r.maxW`, `r.fs` |
| `app/(tabs)/lab.tsx` | `r.isTablet` |
| `app/(tabs)/academy.tsx` | `r.isTablet` |
| `app/edit-profile.tsx` | `r.hp`, `r.maxW` |
| `components/SwipeCard.tsx` | `useWindowDimensions` + `fs()` / `sp()` (inline ölçek) |

> `SwipeCard.tsx` hook'u değil, inline ölçek hesabı kullanır çünkü gesture sürükleme sırasında width değişimi olmaz ve performans kritiktir.

---

## Onboarding Ekranı

`onboarding.tsx` içerik hizalaması için ek bir pattern kullanır:

```typescript
// container: geniş ekranda içeriği ortalar
container: {
  flex: 1,
  alignItems: "center",
}

// inner: genişliği sınırlar
inner: {
  width: "100%",
  maxWidth: 430,
}
```

Bu, içeriğin tablette ortada ve simetrik görünmesini sağlar.

---

## Responsive Padding Yardımcısı (`hp`)

```typescript
hp: (n: number) => n * scale
```

Kullanımı:
```typescript
paddingHorizontal: r.hp(20)
// telefon (390px): 20px
// tablet (768px): 25px (scale 1.25)
// küçük (320px): 18px (scale 0.9)
```

---

## Font Ölçekleme (`fs`)

```typescript
fs: (base: number) => Math.round(base * scale)
```

Kullanımı:
```typescript
fontSize: r.fs(24)
// telefon: 24px
// tablet: 30px
// küçük: 21.6 → 22px (yuvarlama)
```

Şu an `fs()` şu yerlerde uygulandı:
- Karargah ekranı başlık ve istatistik değerleri
- Profil ekranı isim ve stat sayıları
- Onboarding ekranı başlıkları
- SwipeCard post metni, hesap adı, buton metni

---

## Tablet Düzeni

`isTablet` ile bazı bileşenler tablet'te farklı davranır:

```typescript
// index.tsx — mission card genişliği
width: r.isTablet ? 220 : 180

// lab.tsx, academy.tsx — listelerde 2 sütun
numColumns: r.isTablet ? 2 : 1
```

---

## Önceki Durum → Sonraki Durum

Önceden her ekranın kendi içinde ayrı `useWindowDimensions` + `Math.min(Math.max(...))` hesabı vardı:
```typescript
// ESKİ — lab.tsx, academy.tsx, SimulationPlayer.tsx içinde tekrarlanan kod
const { width } = useWindowDimensions();
const isTablet = width >= 600;
```

Artık bu hesaplar `hooks/useResponsive.ts` içinde merkezileştirildi. Tüm yerel kopyalar kaldırıldı.
