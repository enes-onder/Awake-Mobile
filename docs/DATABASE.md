# Veritabanı — Doğruluk Dedektifi

Uygulama [Supabase](https://supabase.com) (PostgreSQL) kullanır. Şema ve başlangıç verileri `supabase/schema_and_seed.sql` dosyasındadır.

---

## Kurulum

**Supabase Dashboard'dan:**
1. Sol menü → **SQL Editor** → New query
2. `supabase/schema_and_seed.sql` dosyasının tüm içeriğini yapıştır
3. **Run** butonuna bas

> "already exists" hatası alırsan tablo zaten var demektir — bu normal, sorun değil.

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
| `clues` | text[] | 3 ipucu metni |
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
| `content` | text[] | Ders paragrafları |
| `quiz` | jsonb[] | Her biri: question, options[], correctIdx, explanation |

#### `simulations` — Senaryo Oyunları

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | text PK | s1–s3 |
| `title`, `description` | text | |
| `difficulty` | int | 1–3 |
| `xp_reward` | int | Tamamlama ödülü |
| `category` | text | |
| `required_xp` | int | Kilit eşiği |
| `steps` | jsonb[] | `narrative` veya `choice` tipinde adımlar |

---

### Kullanıcı Tabloları (RLS Korumalı)

#### `profiles` — Kullanıcı Profilleri

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | uuid PK | Supabase Auth kullanıcı ID'si (`auth.users` ile bağlı) |
| `username` | text | Kod adı |
| `bio` | text | Kısa tanıtım |
| `favorite_topic` | text | Seçilen konu |
| `xp` | int | Toplam XP |
| `badges` | text[] | Kazanılmış rozet ID'leri |
| `streak` | int | Mevcut günlük seri |
| `created_at` | timestamptz | Kayıt tarihi |

> **Not:** Şu an profil verisi `AsyncStorage`'da (cihazda) saklanıyor. `profiles` tablosu ilerideki bulut senkronizasyonu için hazırlanmıştır.

#### `user_mission_progress`

| Kolon | Tip | Açıklama |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid | `profiles.id` ile bağlı |
| `mission_id` | text | `missions.id` ile bağlı |
| `completed` | bool | Tamamlandı mı |
| `correct` | bool | Doğru cevap verildi mi |
| `completed_at` | timestamptz | |

#### `user_lesson_progress` / `user_simulation_progress`

Missions ile aynı yapıda, sırasıyla ders ve simülasyon ilerlemesi için.

---

## Row Level Security (RLS)

```sql
-- İçerik tabloları herkes okuyabilir
CREATE POLICY "missions_public_read" ON missions
  FOR SELECT USING (true);

-- İlerleme tabloları: sadece kendi verisini gör/değiştir
CREATE POLICY "own_progress" ON user_mission_progress
  FOR ALL USING (auth.uid() = user_id);
```

Aynı politika `user_lesson_progress` ve `user_simulation_progress` için de uygulanır.

---

## Başlangıç Verileri (Seed Data)

`schema_and_seed.sql` içinde şu içerikler hazır gelir:

### Vakalar (8 adet)

| ID | Başlık | Verdict | Zorluk |
|---|---|---|---|
| m1 | Sel Felaketi Fotoğrafı | fake | 1 |
| m2 | Bakan Açıklaması | fake | 2 |
| m3 | Aşı Yan Etkileri | real | 2 |
| m4 | Deprem Uyarısı | fake | 3 |
| m5 | Çevre Raporu | real | 1 |
| m6 | Müze Sergisi | real | 2 |
| m7 | YZ Fotoğrafı | fake | 3 |
| m8 | Bilim İnsanı Alıntısı | fake | 2 |

### Dersler (6 adet)

| ID | Başlık | Süre |
|---|---|---|
| l1 | Tersine Görsel Arama | 8 dk |
| l2 | Metadata Analizi | 10 dk |
| l3 | Kaynak Doğrulama | 12 dk |
| l4 | Duygusal Manipülasyon | 9 dk |
| l5 | YZ Görsel Tespiti | 11 dk |
| l6 | Bağlam Çıkarma Tekniği | 10 dk |

### Simülasyonlar (3 adet)

| ID | Başlık | Zorluk |
|---|---|---|
| s1 | Viral WhatsApp Mesajı | Kolay |
| s2 | Siyasetçinin Sahte Sözü | Orta |
| s3 | Deprem Anında Dezenformasyon | Zor |

---

## Offline Mod

`ContentContext.tsx`, Supabase bağlantısı başarısız olursa veya boş veri dönerse otomatik olarak `data/` klasöründeki statik TypeScript dosyalarına geçer:

```
data/missions.ts     ← 8 vaka
data/lessons.ts      ← 6 ders
data/simulations.ts  ← 3 simülasyon
```

Bu sayede internet bağlantısı olmasa da uygulama tam işlevli çalışır.

---

## Supabase URL Yapılandırması

`lib/supabase.ts` dosyasında:
```typescript
const SUPABASE_URL = "https://tojpdbexarwradtepwny.supabase.co";
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
```

URL kodda sabit yazılıdır. Anahtarı değiştirmek için Replit → Secrets → `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
