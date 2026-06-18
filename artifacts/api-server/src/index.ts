/**
 * index.ts — API sunucusunun giriş noktası.
 *
 * PORT ortam değişkenini doğrular ve Express uygulamasını başlatır.
 * PORT tanımlı değilse veya geçersizse başlamadan hata fırlatır.
 */

import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

/** PORT ortam değişkeni zorunludur */
if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

/** NaN veya negatif port değeri geçersizdir */
if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
