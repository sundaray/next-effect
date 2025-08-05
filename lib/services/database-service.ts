import { Effect, Data, Config, Redacted } from "effect";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "@/db/schema";

class DatabaseError extends Data.TaggedError("DatabaseError")<{
  cause: unknown;
}> {}

type DatabaseServiceImp = {
  use: <A>(
    f: (db: PostgresJsDatabase<typeof schema>) => Promise<A>
  ) => Effect.Effect<A, DatabaseError>;
};

export class DatabaseService extends Effect.Service<DatabaseService>()(
  "DatabaseService",
  {
    effect: Effect.gen(function* () {
      const databaseUrl = Redacted.value(
        yield* Config.redacted("DATABASE_URL")
      );

      const client = postgres(databaseUrl, { prepare: false });

      const db = drizzle(client, { schema });

      return {
        use: (f) =>
          Effect.tryPromise({
            try: () => f(db),
            catch: (error) => new DatabaseError({ cause: error }),
          }),
      } satisfies DatabaseServiceImp;
    }),
  }
) {}
