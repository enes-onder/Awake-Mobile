/**
 * routes/health.ts — Canlılık kontrolü endpoint'i.
 *
 * GET /api/healthz — Sunucunun çalıştığını doğrular.
 * Yanıt { status: "ok" } şeklindedir ve @workspace/api-zod şemasıyla doğrulanır.
 * Yük dengeleyiciler ve izleme araçları tarafından kullanılabilir.
 */

import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

/** GET /api/healthz — Zod şemasıyla doğrulanmış sağlık yanıtı döner */
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

export default router;
