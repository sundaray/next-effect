import {
  text,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
  boolean,
  integer,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const pricingTypeEnum = pgEnum("pricing", ["free", "paid", "freemium"]);

export const adminApprovalStatusEnum = pgEnum("admin_approval_status", [
  "pending",
  "approved",
  "rejected",
]);

export const toolHistoryEventEnum = pgEnum("tool_history_event", [
  "submitted",
  "updated",
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

  submittedAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  submittedBy: text("submitted_by")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  approvedAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  rejectionCount: integer("rejection_count").notNull().default(0),
});

export const toolHistory = pgTable("tool_history", {
  id: uuid("id").primaryKey().defaultRandom(),

  toolId: uuid("tool_id")
    .notNull()
    .references(() => tools.id, { onDelete: "cascade" }),

  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  eventType: toolHistoryEventEnum("event_type").notNull(),

  reason: text("reason"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  role: text("role").default("user").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  submissionCount: integer("submission_count").notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verifications = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});
