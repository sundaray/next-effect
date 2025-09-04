import * as schema from "@/db/schema";
import { drizzle } from "drizzle-orm/postgres-js";
import { Config, Effect, Redacted } from "effect";
import postgres from "postgres";

export class DbClientService extends Effect.Service<DbClientService>()(
  "DbClientService",
  {
    effect: Effect.gen(function* () {
      const databaseUrl = Redacted.value(
        yield* Config.redacted("DATABASE_URL"),
      );

      const client = postgres(databaseUrl, { prepare: false });

      return drizzle(client, { schema });
    }),
  },
) {}
