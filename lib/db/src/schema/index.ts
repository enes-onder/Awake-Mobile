/**
 * schema — PostgreSQL tablo tanımları (Drizzle ORM).
 *
 * Her tablo için:
 *  - pgTable()  ile kolon şeması
 *  - createInsertSchema()  ile Zod doğrulama şeması
 *  - TypeScript select/insert tipleri
 *
 * Değişiklik yapıldığında `pnpm --filter @workspace/db run push` komutu
 * gerçek veritabanına yansıtır.
 */

import { pgTable, text, smallint, integer, boolean, bigserial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

// ─── İçerik Tabloları ──────────────────────────────────────────────────────

/** Vakalar — kullanıcının gerçek/sahte kararı verdiği haberler */
export const missionsTable = pgTable("missions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  /** 1=Kolay, 2=Orta, 3=Zor */
  difficulty: smallint("difficulty").notNull(),
  /** photo | headline | quote | stats | video */
  type: text("type").notNull(),
  xpReward: integer("xp_reward").notNull().default(25),
  category: text("category").notNull(),
  /** "real" veya "fake" — doğru cevap */
  verdict: text("verdict").notNull(),
  /** MissionContent JSON objesi — sosyal medya gönderi detayları */
  content: jsonb("content").notNull(),
  /** İpucu metinleri dizisi */
  clues: jsonb("clues").notNull(),
  explanation: text("explanation").notNull(),
  /** Bu vakayı görmek için gereken minimum XP */
  requiredXp: integer("required_xp").notNull().default(0),
  /** Sıralama indeksi */
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/** Dersler — okuma metni ve quiz içeren eğitim modülleri */
export const lessonsTable = pgTable("lessons", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  /** Tahmini okuma süresi, ör: "5 dk" */
  duration: text("duration").notNull(),
  /** Feather icon adı */
  icon: text("icon").notNull(),
  /** Kart vurgu rengi (hex) */
  color: text("color").notNull(),
  xpReward: integer("xp_reward").notNull().default(30),
  /** Paragraf metinleri dizisi */
  content: jsonb("content").notNull(),
  /** LessonQuiz[] — soru, seçenekler ve açıklama */
  quiz: jsonb("quiz").notNull(),
  requiredXp: integer("required_xp").notNull().default(0),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

/** Simülasyonlar — senaryo tabanlı karar ağacı alıştırmaları */
export const simulationsTable = pgTable("simulations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: smallint("difficulty").notNull(),
  xpReward: integer("xp_reward").notNull().default(60),
  category: text("category").notNull(),
  /** SimStep[] — narrative ve choice adımları */
  steps: jsonb("steps").notNull(),
  requiredXp: integer("required_xp").notNull().default(0),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

// ─── Kullanıcı Tabloları ───────────────────────────────────────────────────

/**
 * Profiller — liderlik tablosu ve çapraz cihaz senkronizasyonu için.
 * Kullanıcı adı birincil anahtar olarak kullanılır (UUID yerine).
 */
export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  bio: text("bio").default(""),
  favoriteTopic: text("favorite_topic").default(""),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  /** YYYY-MM-DD formatında son aktif tarih */
  lastActive: text("last_active"),
  usernameLastChanged: timestamp("username_last_changed", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

// ─── İlerleme Tabloları ────────────────────────────────────────────────────

/** Kullanıcının tamamladığı vakalar ve kazandığı XP geçmişi */
export const userMissionProgressTable = pgTable("user_mission_progress", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  missionId: text("mission_id").references(() => missionsTable.id),
  /** "correct" veya "incorrect" */
  result: text("result"),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
});

/** Kullanıcının tamamladığı dersler ve quiz puanları */
export const userLessonProgressTable = pgTable("user_lesson_progress", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").references(() => lessonsTable.id),
  /** Quizde doğru yanıtlanan soru sayısı */
  score: integer("score").default(0),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
});

/** Kullanıcının tamamladığı simülasyonlar */
export const userSimulationProgressTable = pgTable("user_simulation_progress", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  simulationId: text("simulation_id").references(() => simulationsTable.id),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
});

// ─── Zod Şemaları (insert doğrulaması) ────────────────────────────────────

export const insertMissionSchema = createInsertSchema(missionsTable);
export const insertLessonSchema = createInsertSchema(lessonsTable);
export const insertSimulationSchema = createInsertSchema(simulationsTable);
export const insertProfileSchema = createInsertSchema(profilesTable);

// ─── TypeScript Tipleri ────────────────────────────────────────────────────

export type Mission = typeof missionsTable.$inferSelect;
export type Lesson = typeof lessonsTable.$inferSelect;
export type Simulation = typeof simulationsTable.$inferSelect;
export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
