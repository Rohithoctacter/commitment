import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  goalDays: integer("goal_days").notNull(),
  completedDays: integer("completed_days").notNull().default(0),
  startDate: timestamp("start_date").notNull().defaultNow(),
  lastCheckIn: timestamp("last_check_in"),
  isActive: text("is_active").notNull().default("true"),
});

export const insertGoalSchema = createInsertSchema(goals).pick({
  goalDays: true,
});

export const checkInSchema = z.object({
  goalId: z.string(),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;
export type CheckIn = z.infer<typeof checkInSchema>;
