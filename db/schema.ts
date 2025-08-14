import { text, pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const pricingTypeEnum = pgEnum("pricing", ["free", "paid", "freemium"]);

export const adminApprovalStatusEnum = pgEnum("admin_approval_status", [
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
  showcaseImageUrl: text("showcase_image_url").notNull(),
  adminApprovalStatus: adminApprovalStatusEnum("admin_approval_status")
    .default("pending")
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
