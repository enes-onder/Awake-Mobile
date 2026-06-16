import { pgTable, text, smallint, integer, boolean, bigserial, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const missionsTable = pgTable("missions", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: smallint("difficulty").notNull(),
  type: text("type").notNull(),
  xpReward: integer("xp_reward").notNull().default(25),
  category: text("category").notNull(),
  verdict: text("verdict").notNull(),
  content: jsonb("content").notNull(),
  clues: jsonb("clues").notNull(),
  explanation: text("explanation").notNull(),
  requiredXp: integer("required_xp").notNull().default(0),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const lessonsTable = pgTable("lessons", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  duration: text("duration").notNull(),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  xpReward: integer("xp_reward").notNull().default(30),
  content: jsonb("content").notNull(),
  quiz: jsonb("quiz").notNull(),
  requiredXp: integer("required_xp").notNull().default(0),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const simulationsTable = pgTable("simulations", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: smallint("difficulty").notNull(),
  xpReward: integer("xp_reward").notNull().default(60),
  category: text("category").notNull(),
  steps: jsonb("steps").notNull(),
  requiredXp: integer("required_xp").notNull().default(0),
  orderIndex: integer("order_index").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const profilesTable = pgTable("profiles", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  bio: text("bio").default(""),
  favoriteTopic: text("favorite_topic").default(""),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  streak: integer("streak").notNull().default(0),
  lastActive: text("last_active"),
  usernameLastChanged: timestamp("username_last_changed", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const userMissionProgressTable = pgTable("user_mission_progress", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  missionId: text("mission_id").references(() => missionsTable.id),
  result: text("result"),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
});

export const userLessonProgressTable = pgTable("user_lesson_progress", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  lessonId: text("lesson_id").references(() => lessonsTable.id),
  score: integer("score").default(0),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
});

export const userSimulationProgressTable = pgTable("user_simulation_progress", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  userId: text("user_id").references(() => profilesTable.id, { onDelete: "cascade" }),
  simulationId: text("simulation_id").references(() => simulationsTable.id),
  xpEarned: integer("xp_earned").default(0),
  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow(),
});

export const insertMissionSchema = createInsertSchema(missionsTable);
export const insertLessonSchema = createInsertSchema(lessonsTable);
export const insertSimulationSchema = createInsertSchema(simulationsTable);
export const insertProfileSchema = createInsertSchema(profilesTable);

export type Mission = typeof missionsTable.$inferSelect;
export type Lesson = typeof lessonsTable.$inferSelect;
export type Simulation = typeof simulationsTable.$inferSelect;
export type Profile = typeof profilesTable.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
