/**
 * routes/profiles.ts — Kullanıcı profili ve liderlik tablosu endpoint'leri.
 *
 * Endpoints:
 *  POST /api/profiles/upsert — Profil oluştur veya güncelle (upsert)
 *  GET  /api/leaderboard     — XP'ye göre sıralı kullanıcı listesi
 *
 * Upsert mantığı:
 *  - id ve username olarak kullanıcı adı kullanılır (uuid yok)
 *  - Mevcut kayıt varsa xp/streak/level/bio/favoriteTopic güncellenir
 *  - Tüm gelen sayısal değerler sunucu tarafında doğrulanır (negatif XP, geçersiz level vb.)
 */

import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { profilesTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";

const router: IRouter = Router();

/**
 * POST /api/profiles/upsert
 * İstek gövdesi: { username, xp, streak, level, bio?, favoriteTopic? }
 * Yanıt: { ok: true } veya { error: string }
 */
router.post("/profiles/upsert", async (req, res) => {
  const { username, xp, streak, level, bio, favoriteTopic } = req.body ?? {};

  /** username boşsa 400 döner */
  if (typeof username !== "string" || username.trim().length === 0) {
    res.status(400).json({ error: "username is required" });
    return;
  }

  /** Sayısal alanlar doğrulanır; geçersizse güvenli varsayılan değerler kullanılır */
  const safeXP       = typeof xp === "number" && xp >= 0         ? Math.floor(xp)     : 0;
  const safeStreak   = typeof streak === "number" && streak >= 0 ? Math.floor(streak) : 0;
  const safeLevel    = typeof level === "number" && level >= 1   ? Math.floor(level)  : 1;
  const safeBio      = typeof bio === "string"          ? bio          : "";
  const safeFavTopic = typeof favoriteTopic === "string" ? favoriteTopic : "";
  /** Kullanıcı adı maksimum 64 karakter ile sınırlanır */
  const name = username.trim().slice(0, 64);

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
