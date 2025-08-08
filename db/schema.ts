import { text, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const pricingTypeEnum = pgEnum("pricing", [
  "free",
  "premium",
  "freemium",
]);

export const toolStatusEnum = pgEnum("status", [
  "pending",
  "approved",
  "rejected",
]);

export const tools = pgTable("tools", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  website: text("website").notNull(),
  tagline: text("tagline").notNull(),
  description: text("description").notNull(),
  categories: text("categories")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  pricing: pricingTypeEnum("pricing").notNull(),
  logoUrl: text("logo_url"),
  homepageScreenshotUrl: text("homepage_screenshot_url").notNull(),
  status: toolStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
