/**
 * app.ts — Express uygulamasını yapılandırır ve dışa aktarır.
 *
 * Middleware sırası:
 *  1. pino-http — her isteği yapılandırılmış JSON olarak loglar
 *  2. cors — tüm kaynaklara izin verir (geliştirme + Replit önizleme için)
 *  3. express.json — JSON istek gövdelerini parse eder
 *  4. express.urlencoded — form verisi desteği
 *  5. /api — tüm uygulama route'larının kök yolu
 */

import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

/** Yapılandırılmış HTTP istek/yanıt logu — query string'i gizler */
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          /** Sorgu parametrelerini log'a yazmaz (hassas veri olabilir) */
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

/** Tüm origin'lere CORS izni — production'da kısıtlanmalıdır */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** Tüm API route'ları /api ön ekiyle erişilir */
app.use("/api", router);

export default app;
