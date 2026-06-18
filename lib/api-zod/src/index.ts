/**
 * lib/api-zod — Zod doğrulama şemaları ve TypeScript tipleri.
 *
 * Bu paket, OpenAPI şemasından (lib/api-spec/openapi.yaml) Orval tarafından
 * otomatik olarak üretilmiş Zod şemalarını ve tip tanımlarını dışa aktarır.
 *
 * İçerik:
 *  - generated/api.ts  — HealthCheckResponse gibi API yanıt şemaları
 *  - generated/types.ts — İlgili TypeScript tipleri
 *
 * Kullanım (API server'da):
 *  import { HealthCheckResponse } from "@workspace/api-zod";
 *  const data = HealthCheckResponse.parse({ status: "ok" });
 *
 * Yeniden üretmek için:
 *  pnpm --filter @workspace/api-zod run codegen
 */

/** Tüm Zod şemalarını yeniden dışa aktar */
export * from "./generated/api";

/** Tüm TypeScript tiplerini yeniden dışa aktar */
export * from "./generated/types";
