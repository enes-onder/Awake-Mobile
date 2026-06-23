/**
 * routes/profiles.ts — Kullanıcı profili ve liderlik tablosu endpoint'leri.
 *
 * Endpoints:
 *  POST /api/profiles/upsert — Profil oluştur veya güncelle (upsert)
 *  GET  /api/leaderboard     — XP'ye göre sıralı kullanıcı listesi
 *
 * ─── Güven Sınırı / Trust Boundary ─────────────────────────────────────────
 *
 * Bu endpoint gerçek bir kimlik doğrulama (auth) yapmaz.
 *
 * Uygulama yerel/misafir-öncelikli (local/guest-first) mimariye sahiptir:
 *  - Kullanıcı kimliği yalnızca cihazda AsyncStorage'da saklanır.
 *  - `username` bir oturum tokeni değildir; herkes herhangi bir kullanıcı adıyla
 *    POST atıp o kullanıcının profilini güncelleyebilir.
 *  - XP ve diğer sayısal değerler istemci tarafından (client-submitted) gönderilir;
 *    sunucu bu değerleri yeniden hesaplamaz.
 *
 * Bu mimari sonucu olarak:
 *  - Liderlik tablosu (leaderboard) authoritative (güvenilir/doğrulanmış) değildir.
 *  - Liderlik tablosu community/demo amaçlıdır; rekabetçi veya ödüllü kullanım için
 *    uygun değildir.
 *
 * Gelecekte gerçek güvenlik için yapılması gerekenler (TODO):
 *  - Sunucu tarafı oturum/kimlik sistemi (cihaz başına imzalı token veya OAuth).
 *  - Upsert endpoint'ini yalnızca token sahibinin kendi profilini güncellemesine izin
 *    verecek şekilde kısıtla.
 *  - XP değişikliklerini istemciden toplu almak yerine sunucu tarafında event olarak
 *    kaydet ve doğrula (server-side XP event validation).
 * ────────────────────────────────────────────────────────────────────────────
 *
 * Upsert mantığı:
 *  - id ve username olarak kullanıcı adı kullanılır (uuid yok)
 *  - Mevcut kayıt varsa xp/streak/level/bio/favoriteTopic güncellenir
 *  - Tüm gelen sayısal değerler sunucu tarafında finite + clamp ile doğrulanır
 *  - Metin alanları trim + uzunluk sınırı ile sanitize edilir
 */

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

// ─── Validasyon Sabitleri ───────────────────────────────────────────────────

const MAX_USERNAME_LENGTH = 64;
const MAX_BIO_LENGTH = 280;
const MAX_FAVORITE_TOPIC_LENGTH = 64;
const MAX_XP = 9_999;
const MAX_STREAK = 365;
const MIN_LEVEL = 1;
const MAX_LEVEL = 5;

// ─── Yardımcı Fonksiyonlar ──────────────────────────────────────────────────

/**
 * Sayısal değeri geçerli aralığa sıkıştırır.
 * Sonsuz veya NaN değerlerde `fallback` döner.
 */
function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.floor(value), min), max);
}

/**
 * Metin değerini trim'ler ve maksimum uzunluğa kırpar.
 * String değilse boş string döner.
 */
function sanitizeText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

// ─── Endpoint'ler ───────────────────────────────────────────────────────────

/**
 * POST /api/profiles/upsert
 * İstek gövdesi: { username, xp, streak, level, bio?, favoriteTopic? }
 * Yanıt: { ok: true } veya { error: string }
 *
 * Güven sınırı için yukarıdaki dosya başlığına bakınız.
 */
router.post("/profiles/upsert", async (req, res) => {
  const { username, xp, streak, level, bio, favoriteTopic } = req.body ?? {};

  /** username boş veya string değilse 400 döner */
  if (typeof username !== "string" || username.trim().length === 0) {
    res.status(400).json({ error: "username is required" });
    return;
  }

  /** Kullanıcı adı trim'lenir ve maksimum uzunluğa kırpılır */
  const name = username.trim().slice(0, MAX_USERNAME_LENGTH);

  /** Sayısal alanlar finite + clamp ile doğrulanır */
  const safeXP = clampNumber(xp, 0, MAX_XP, 0);
  const safeStreak = clampNumber(streak, 0, MAX_STREAK, 0);
  const safeLevel = clampNumber(level, MIN_LEVEL, MAX_LEVEL, MIN_LEVEL);

  /** Metin alanları sanitize edilir */
  const safeBio = sanitizeText(bio, MAX_BIO_LENGTH);
  const safeFavTopic = sanitizeText(favoriteTopic, MAX_FAVORITE_TOPIC_LENGTH);

  try {
    await db
      .insert(profilesTable)
      .values({
        id: name,
        username: name,
        xp: safeXP,
        streak: safeStreak,
        level: safeLevel,
        bio: safeBio,
        favoriteTopic: safeFavTopic,
        /** YYYY-MM-DD formatında son aktif tarih */
        lastActive: new Date().toISOString().split("T")[0],
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: profilesTable.id,
        set: {
          xp: safeXP,
          streak: safeStreak,
          level: safeLevel,
          bio: safeBio,
          favoriteTopic: safeFavTopic,
          lastActive: new Date().toISOString().split("T")[0],
          updatedAt: new Date(),
        },
      });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to upsert profile" });
  }
});

/**
 * GET /api/leaderboard?limit=50
 * Kullanıcıları XP'ye göre azalan sırada döner.
 * limit: 1–100 arasında, varsayılan 50.
 * Yalnızca liderlik tablosunda görünmesi gereken alanlar seçilir (hassas veri dışarıya açılmaz).
 *
 * Not: Bu veriler client-submitted XP'ye dayanır; authoritative değildir.
 */
router.get("/leaderboard", async (req, res) => {
  const rawLimit = Number(req.query["limit"] ?? 50);
  /** Geçersiz veya aşırı büyük limit değerini sınırla */
  const limit = isNaN(rawLimit) ? 50 : Math.min(Math.max(1, rawLimit), 100);

  try {
    const rows = await db
      .select({
        id: profilesTable.id,
        username: profilesTable.username,
        xp: profilesTable.xp,
        streak: profilesTable.streak,
        level: profilesTable.level,
      })
      .from(profilesTable)
      .orderBy(desc(profilesTable.xp))
      .limit(limit);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
