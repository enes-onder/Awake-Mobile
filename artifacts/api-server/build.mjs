/**
 * build.mjs — API sunucusu için esbuild derleme betiği.
 *
 * TypeScript kaynak dosyalarını (`src/index.ts`) tek bir ESM bundle'a derler
 * ve `dist/index.mjs` olarak çıktı verir. Kaynak haritaları (sourcemap) da üretilir.
 *
 * Neden esbuild?
 *  - tsc'den çok daha hızlı (özellikle monorepo bağımlılıklarında)
 *  - Native Node modülleri (*.node) ve platform özelinde paketler kolayca dışarıda bırakılır
 *
 * pino-pretty desteği:
 *  pino, log aktarımını worker thread'lerle yönetir. esbuild-plugin-pino bu worker'ları
 *  doğru şekilde pakete ekler; aksi hâlde geliştirme modunda renkli çıktı çalışmaz.
 *
 * CJS→ESM uyumluluğu:
 *  express gibi bazı paketler yalnızca CommonJS formatında dağıtılır.
 *  Banner'daki globalThis.require, __filename ve __dirname tanımları bu paketlerin
 *  ESM çıktısının içinde sorunsuz çalışmasını sağlar.
 */

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { rm } from "node:fs/promises";

/** Bazı eklentiler (esbuild-plugin-pino) bağımlılıkları require() ile çözer */
globalThis.require = createRequire(import.meta.url);

/** Bu dosyanın bulunduğu dizin — artifacts/api-server/ */
const artifactDir = path.dirname(fileURLToPath(import.meta.url));

async function buildAll() {
  /** Her derlemede dist/ klasörünü temizle — eski dosyaların kalmasını önle */
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  await esbuild({
    /** Giriş noktası: TypeScript kaynak dosyası */
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    /** Tüm bağımlılıkları tek dosyada birleştir (node_modules dahil) */
    bundle: true,
    /** ESM formatında çıktı — import/export destekli Node.js için */
    format: "esm",
    outdir: distDir,
    /** .js → .mjs: Node.js'in ESM olarak tanıması için */
    outExtension: { ".js": ".mjs" },
    logLevel: "info",

    /**
     * Dışarıda bırakılan paketler (bundle'a dahil edilmez):
     *  - Native modüller (*.node): platform özgü, derleme gerektirir
     *  - Büyük/opsiyonel paketler: sharp, canvas, bcrypt vb. — bu projede kullanılmıyor
     *  - ORM'ler: knex, typeorm, sequelize, prisma — Drizzle kullanıldığı için gereksiz
     *  - Cloud SDK'ları: aws-sdk, @azure, @google-cloud — bu projede kullanılmıyor
     */
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "xxhash-addon",
      "bufferutil",
      "utf-8-validate",
      "ssh2",
      "cpu-features",
      "dtrace-provider",
      "isolated-vm",
      "lightningcss",
      "pg-native",
      "oracledb",
      "mongodb-client-encryption",
      "nodemailer",
      "handlebars",
      "knex",
      "typeorm",
      "protobufjs",
      "onnxruntime-node",
      "@tensorflow/*",
      "@prisma/client",
      "@mikro-orm/*",
      "@grpc/*",
      "@swc/*",
      "@aws-sdk/*",
      "@azure/*",
      "@opentelemetry/*",
      "@google-cloud/*",
      "@google/*",
      "googleapis",
      "firebase-admin",
      "@parcel/watcher",
      "@sentry/profiling-node",
      "@tree-sitter/*",
      "aws-sdk",
      "classic-level",
      "dd-trace",
      "ffi-napi",
      "grpc",
      "hiredis",
      "kerberos",
      "leveldown",
      "miniflare",
      "mysql2",
      "newrelic",
      "odbc",
      "piscina",
      "realm",
      "ref-napi",
      "rocksdb",
      "sass-embedded",
      "sequelize",
      "serialport",
      "snappy",
      "tinypool",
      "usb",
      "workerd",
      "wrangler",
      "zeromq",
      "zeromq-prebuilt",
      "playwright",
      "puppeteer",
      "puppeteer-core",
      "electron",
    ],

    /** Kaynak haritası: Node.js --enable-source-maps ile orijinal TS satırları görünür */
    sourcemap: "linked",

    plugins: [
      /**
       * pino-pretty eklentisi:
       * pino'nun log worker'larını ve pino-pretty aktarımını
       * bundle'a doğru şekilde dahil eder.
       */
      esbuildPluginPino({ transports: ["pino-pretty"] })
    ],

    /**
     * CJS→ESM uyumluluk başlığı:
     * express gibi CommonJS paketleri ESM ortamında require/
     * __filename/__dirname kullandığı için bu global tanımlar gereklidir.
     */
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
    `,
    },
  });
}

/** Derlemeyi başlat; hata oluşursa stderr'e yaz ve process'i sonlandır */
buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
