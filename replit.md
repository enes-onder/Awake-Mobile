# Doğruluk Dedektifi

Türkçe oyunlaştırılmış haber okuryazarlığı mobil uygulaması. Kullanıcılar sahte haberleri gerçeklerden ayırt etmeyi öğrenir, vaka çözer, ders tamamlar ve liderlik tablosunda yükselir.

## Mimari

**Monorepo** (pnpm workspaces):

| Paket | Yol | Açıklama |
|---|---|---|
| Mobil Uygulama | `artifacts/mobile/` | Expo React Native (web + iOS + Android) |
| API Sunucusu | `artifacts/api-server/` | Express v5 REST API |
| Veritabanı | `lib/db/` | Drizzle ORM + Replit PostgreSQL |
| API Spec | `lib/api-spec/` | OpenAPI YAML tanımı |
| API Zod | `lib/api-zod/` | Orval ile üretilmiş Zod şemaları |

## Port Düzeni

```
Tarayıcı → :5000 (web-proxy.js)
               ├── /api/* → :3001 (Express API)
               └── diğer  → :18115 (Expo Metro)
```

Proxy sayesinde tarayıcı yalnızca port 5000'e istek atar → CORS sorunu yaşanmaz.

## Workflow'lar

| Workflow | Komut |
|---|---|
| `API Server` | `cd artifacts/api-server && PORT=3001 NODE_ENV=development node ./build.mjs && PORT=3001 node --enable-source-maps ./dist/index.mjs` |
| `Doğruluk Dedektifi` | Expo web proxy + Metro bundler |

## Veritabanı Kurulumu

```bash
# Şemayı veritabanına uygula
pnpm --filter @workspace/db run push

# Başlangıç verisini yükle (8 vaka, 6 ders, 3 simülasyon)
pnpm --filter @workspace/db run seed
```

## Ortam Değişkenleri

| Değişken | Zorunlu | Açıklama |
|---|---|---|
| `DATABASE_URL` | Evet | Replit PostgreSQL bağlantı dizesi (Secrets'ta tanımlı) |
| `PORT` | Hayır | API sunucu portu (varsayılan: 3001) |

> `EXPO_PUBLIC_API_URL` **tanımlanmamalıdır** — bundle relative URL kullanır, proxy yönlendirme yapar.

## Ekranlar

- **Onboarding** → Tanıtım slaytları + kod adı girişi
- **Karargah** (`/`) → Günlük görev, istatistikler, streak kartı
- **Haber Lab** (`/lab`) → Vaka analizi (swipe) + simülasyonlar
- **Akademi** (`/academy`) → Dersler + rozetler
- **Profil** (`/profile`) → XP, rütbe, istatistikler, liderlik tablosu

## Oyun Mekaniği

- **XP** — Her doğru vaka/ders/simülasyon tamamlamada kazanılır
- **Rütbe** — XP eşiklerine göre otomatik yükselme (Çaylak → Efsane)
- **Streak** — Günlük giriş serisi
- **Rozetler** — Özel başarı koşullarını tamamlayınca kilidi açılır

## Bağlayıcı Geliştirme Kuralları

Tüm geliştirme işleri `PROJECT_RULES.md` dosyasındaki kurallara uymalıdır. Hata düzeltme öncelikleri için `FEEDBACK.md` takip edilir.

## Kullanıcı Tercihleri

- Tüm dosyalar Türkçe yorum satırları içermeli
- Her bileşenin tek sorumluluğu olmalı (SRP)
- Yeni route eklenince `lib/api-spec/openapi.yaml` güncellenebilir
