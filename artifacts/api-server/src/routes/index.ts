/**
 * routes/index.ts — Tüm API route'larını tek bir router'da birleştirir.
 *
 * Bu dosya app.ts tarafından /api ön ekiyle mount edilir.
 * Yeni bir route grubu eklendiğinde buraya import edilmeli ve use() ile bağlanmalıdır.
 */

import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contentRouter from "./content";
import profilesRouter from "./profiles";

const router: IRouter = Router();

/** GET /api/healthz — Canlılık kontrolü */
router.use(healthRouter);

/** GET /api/missions, /api/lessons, /api/simulations — İçerik endpoint'leri */
router.use(contentRouter);

/** POST /api/profiles/upsert, GET /api/leaderboard — Kullanıcı endpoint'leri */
router.use(profilesRouter);

export default router;
