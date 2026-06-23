# Veritabanı — Doğruluk Dedektifi

Uygulama **Replit PostgreSQL** kullanır. Şema **Drizzle ORM** ile yönetilir (`lib/db/src/schema/index.ts`). Bağlantı `DATABASE_URL` ortam değişkeni üzerinden sağlanır; Replit bunu otomatik tanımlar.

---

## Kurulum

```bash
# Şemayı veritabanına uygula
pnpm --filter @workspace/db run push

# Başlangıç verilerini yükle
pnpm --filter @workspace/db run seed
```

> Replit ortamında `DATABASE_URL` Secrets panelinden otomatik gelir; elle tanımlamana gerek yoktur.

---

## Şema Konumu

```
lib/db/src/schema/index.ts   ← Tüm tablo tanımları (Drizzle)
lib/db/src/index.ts          ← Drizzle bağlantısı (DATABASE_URL kullanır)
```

---

## Tablolar

### İçerik Tabloları (Herkes Okuyabilir)

#### `missions` — Vaka Analizleri

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | text PK | Benzersiz kimlik (m1–m8) |
| `title` | text | Görev başlığı |
| `description` | text | Kısa açıklama |
| `difficulty` | int | 1=Kolay, 2=Orta, 3=Zor |
| `type` | text | `photo`, `headline`, `quote`, `stats`, `video` |
| `xp_reward` | int | Kazanılacak XP |
| `category` | text | Dezenformasyon kategorisi |
| `required_xp` | int | Bu vakayı görmek için gereken min. XP |
| `verdict` | text | `"real"` veya `"fake"` |
| `content` | jsonb | Sosyal medya paylaşımı detayları |
| `clues` | jsonb | 3 ipucu metni |
| `explanation` | text | Doğru cevap açıklaması |

#### `lessons` — Ders İçerikleri

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | text PK | l1–l6 |
| `title`, `subtitle` | text | Görünen başlıklar |
| `duration` | text | Ör: "8 dk" |
| `icon`, `color` | text | Kart görünümü |
| `xp_reward` | int | Temel XP ödülü |
| `required_xp` | int | Kilit eşiği |
| `content` | jsonb | Ders paragrafları |
| `quiz` | jsonb | Her biri: question, options[], correctIdx, explanation |

#### `simulations` — Senaryo Oyunları

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | text PK | s1–s3 |
| `title`, `description` | text | |
| `difficulty` | int | 1–3 |
| `xp_reward` | int | Tamamlama ödülü |
| `category` | text | |
| `required_xp` | int | Kilit eşiği |
| `steps` | jsonb | `narrative` veya `choice` tipinde adımlar |

---

### Kullanıcı Tabloları

#### `profiles` — Kullanıcı Profilleri

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | text PK | Kullanıcı adı (benzersiz kod adı) |
| `username` | text | Görünen ad |
| `bio` | text | Kısa tanıtım |
| `favorite_topic` | text | Seçilen konu |
| `xp` | int | Toplam XP |
| `level` | int | Rütbe seviyesi (1–5) |
| `streak` | int | Mevcut günlük seri |
| `created_at` | timestamptz | Kayıt tarihi |

> **Not:** Profil verisi öncelikle `AsyncStorage`'da (cihazda) saklanır. `profiles` tablosu liderlik tablosu senkronizasyonu için kullanılır; API sunucusu `POST /api/profiles/upsert` ile güncellenir.

---

## Offline Mod

`ContentContext.tsx`, API sunucusuna bağlantı başarısız olursa veya boş veri dönerse otomatik olarak `data/` klasöründeki statik TypeScript dosyalarına geçer:

```
artifacts/mobile/data/missions.ts     ← 8 vaka
artifacts/mobile/data/lessons.ts      ← 6 ders
artifacts/mobile/data/simulations.ts  ← 3 simülasyon
```

Bu sayede internet bağlantısı olmasa da uygulama tam işlevsel çalışır.

---

## Başlangıç Verileri (Seed Data)

`lib/db/` içindeki seed scripti çalıştırıldığında şu içerikler yüklenir:

### Vakalar (8 adet)

| ID | Başlık | Verdict | Zorluk |
|---|---|---|---|
| m1 | Sel Felaketi Fotoğrafı | fake | 1 |
| m2 | Bakan Açıklaması | fake | 2 |
| m3 | Aşı Yan Etkileri | fake | 2 |
| m4 | Deprem Uyarısı | fake | 1 |
| m5 | Çevre Raporu | fake | 3 |
| m6 | Müze Sergisi | real | 1 |
| m7 | YZ Fotoğrafı | fake | 3 |
| m8 | Bilim İnsanı Alıntısı | fake | 2 |

### Dersler (6 adet)

| ID | Başlık | Süre |
|---|---|---|
| l1 | Tersine Görsel Arama | 5 dk |
| l2 | Metadata Analizi | 7 dk |
| l3 | Kaynak Doğrulama | 6 dk |
| l4 | Duygusal Manipülasyon | 8 dk |
| l5 | YZ Görsel Tespiti | 6 dk |
| l6 | Bağlam Çıkarma Tekniği | 5 dk |

### Simülasyonlar (3 adet)

| ID | Başlık | Zorluk |
|---|---|---|
| s1 | Viral WhatsApp Mesajı | Kolay |
| s2 | Siyasetçinin Sahte Sözü | Orta |
| s3 | Deprem Anında Dezenformasyon | Zor |

---

## Supabase Notu

`supabase/schema_and_seed.sql` dosyası eski bir tasarım artefaktıdır. Aktif mimari **Drizzle + Replit PostgreSQL**'dir. RLS (Row Level Security) ve `auth.users` gibi Supabase'e özgü özellikler aktif olarak kullanılmamaktadır.
