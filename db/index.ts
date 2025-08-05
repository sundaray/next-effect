import { Effect, Config, Redacted } from "effect";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrlConfig = Config.redacted("DATABASE_URL");

const databaseUrl = Redacted.value(Effect.runSync(databaseUrlConfig));

const client = postgres(databaseUrl, { prepare: false });

export const db = drizzle(client);
