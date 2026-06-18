/**
 * drizzle.config.ts — Drizzle Kit için migration ve şema yapılandırması.
 *
 * `pnpm --filter @workspace/db run push` komutu bu dosyayı okuyarak
 * schema/index.ts'deki tablo tanımlarını gerçek PostgreSQL veritabanına uygular.
 *
 * DATABASE_URL tanımlı değilse komut başlamadan hata fırlatır.
 */

import { defineConfig } from "drizzle-kit";
import path from "path";

/** DATABASE_URL yoksa migration çalışamaz */
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  /** TypeScript şema dosyasının yolu */
  schema: path.join(__dirname, "./src/schema/index.ts"),
  /** PostgreSQL dialect (MySQL veya SQLite değil) */
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
