import { Config, Effect, Redacted } from "effect";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@/db/schema";

export class DbClientService extends Effect.Service<DbClientService>()(
  "DbClientService",
  {
    effect: Effect.gen(function* () {
      const databaseUrl = Redacted.value(
        yield* Config.redacted("DATABASE_URL")
      );

      const client = postgres(databaseUrl, { prepare: false });

      return drizzle(client, { schema });
    }),
  }
) {}
