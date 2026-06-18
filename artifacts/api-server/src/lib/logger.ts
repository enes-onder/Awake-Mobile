/**
 * logger.ts — Yapılandırılmış JSON logger (pino).
 *
 * Geliştirme ortamında pino-pretty ile renkli ve okunabilir çıktı verir.
 * Production ortamında ham JSON formatında çıktı üretir (log toplayıcılar için).
 *
 * Hassas başlıklar (Authorization, Cookie, set-cookie) otomatik olarak
 * loglardan çıkarılır (redact).
 */

import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  /** LOG_LEVEL ortam değişkeniyle override edilebilir; varsayılan "info" */
  level: process.env.LOG_LEVEL ?? "info",
  /** Hassas HTTP başlıklarını log çıktısından gizle */
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(isProduction
    ? {}
    : {
        /** Geliştirme: renkli, okunabilir terminal çıktısı */
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }),
});
