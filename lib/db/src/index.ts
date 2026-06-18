/**
 * lib/db — Drizzle ORM veritabanı bağlantısı.
 *
 * DATABASE_URL ortam değişkeninden PostgreSQL bağlantısını alır,
 * bir pg.Pool oluşturur ve Drizzle ile sarar.
 * Tüm route handler'lar bu modülden `db` örneğini import eder.
 */

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

/** DATABASE_URL yoksa uygulama başlamadan hata fırlatır */
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

/** Bağlantı havuzu — pg.Pool ile birden fazla eş zamanlı sorgu desteklenir */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

/** Drizzle ORM örneği — tip güvenli sorgular için tüm schema tanımları yüklüdür */
export const db = drizzle(pool, { schema });

/** Schema'dan türetilen tüm tablo ve tip tanımlarını yeniden dışa aktarır */
export * from "./schema";
